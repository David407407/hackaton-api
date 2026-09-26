/*
 * DosiCare · Firmware del dispensador (ESP32)
 *
 * Flujo con la API en Render:
 *   1. GET  /api/tasks/next              → la API reserva la siguiente toma que ya toca
 *   2. Gira el servo del compartimento `slotMotor`, `cantidad` veces
 *   3. POST /api/tasks/:id/confirmar     → la API la marca entregada y descuenta el stock
 *
 * Si la confirmación no llega (timeout, reinicio), la API vuelve a entregar la
 * misma toma a los 2 min. Por eso el id de la última toma girada se guarda en
 * memoria no volátil: si vuelve a llegar, solo se confirma y NO se gira otra vez.
 *
 * Librerías (Gestor de bibliotecas): ArduinoJson (v7) y ESP32Servo.
 */
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

// ---------- Configuración (no subas valores reales al repo) ----------
const char* WIFI_SSID  = "TU_RED";
const char* WIFI_PASS  = "TU_PASSWORD";
const char* API_BASE   = "https://tu-proyecto.onrender.com/api";  // sin "/" al final

// Consultar seguido mantiene despierto el servidor gratis de Render (se duerme a los 15 min)
// y hace que el inventario muestre "Hardware en línea" (< 2 min desde la última consulta).
const unsigned long POLL_MS = 10000;
// Render tarda 30–60 s en despertar: con el timeout por defecto (5 s) el ESP32 se rendiría.
const uint16_t HTTP_TIMEOUT_MS = 60000;

// Compartimento C1..C4 → pin del servo (índice 0 = C1). Ajusta a tu cableado.
const int NUM_SERVOS = 4;
const int SERVO_PINS[NUM_SERVOS] = {13, 12, 14, 27};
const int ANGULO_REPOSO = 0;
const int ANGULO_SOLTAR = 90;   // ángulo que deja caer una pastilla; ajusta a tu mecanismo
const int PAUSA_SERVO_MS = 600;

Servo servos[NUM_SERVOS];
Preferences prefs;
String tomaSinConfirmar = "";   // id de la última toma que ya se giró pero la API no ha confirmado

// ---------- HTTP ----------
// Render solo sirve bien por HTTPS. setInsecure() no valida el certificado (suficiente para
// la hackatón); en producción usa client.setCACert() con la CA raíz del dominio.
int peticion(const char* metodo, const String& ruta, String& respuesta) {
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.setConnectTimeout(20000);
  http.setTimeout(HTTP_TIMEOUT_MS);
  if (!http.begin(client, String(API_BASE) + ruta)) return -1;

  int code = strcmp(metodo, "POST") == 0 ? http.POST("") : http.GET();
  if (code > 0) respuesta = http.getString();
  http.end();
  return code;
}

// ---------- Servos ----------
// false si el compartimento no existe: la toma no se gira ni se confirma
bool dispensar(int slot, int cantidad) {
  if (slot < 1 || slot > NUM_SERVOS) {
    Serial.printf("slotMotor %d fuera de rango (C1..C%d)\n", slot, NUM_SERVOS);
    return false;
  }
  Servo& servo = servos[slot - 1];
  for (int i = 0; i < cantidad; i++) {
    servo.write(ANGULO_SOLTAR);
    delay(PAUSA_SERVO_MS);
    servo.write(ANGULO_REPOSO);
    delay(PAUSA_SERVO_MS);
  }
  return true;
}

// ---------- Confirmación ----------
void guardarSinConfirmar(const String& id) {
  tomaSinConfirmar = id;
  prefs.putString("sinConfirmar", id);   // sobrevive a un reinicio del ESP32
}

// true si la API ya la tiene como entregada (200) o nunca la va a aceptar (4xx): se olvida
bool confirmar(const String& id) {
  String respuesta;
  int code = peticion("POST", "/tasks/" + id + "/confirmar", respuesta);
  Serial.printf("Confirmar %s → HTTP %d\n", id.c_str(), code);
  if (code == 200 || (code >= 400 && code < 500)) {
    guardarSinConfirmar("");
    return true;
  }
  return false;   // sin red, timeout o 5xx: se reintenta en la siguiente vuelta
}

// ---------- Ciclo principal ----------
void consultarTarea() {
  // Primero, terminar de confirmar lo que ya se giró
  if (tomaSinConfirmar.length() > 0 && !confirmar(tomaSinConfirmar)) return;

  String respuesta;
  int code = peticion("GET", "/tasks/next", respuesta);
  if (code != 200) {
    Serial.printf("GET /tasks/next → HTTP %d\n", code);
    return;
  }

  JsonDocument doc;
  if (deserializeJson(doc, respuesta) || doc["task"].isNull()) return;   // no hay tomas por ahora

  String id    = doc["task"]["id"].as<String>();
  int slot     = doc["task"]["slotMotor"];
  int cantidad = doc["task"]["cantidad"] | 1;
  Serial.printf("Toma %s: %d pastilla(s) de C%d para %s (tarjeta %s)\n", id.c_str(), cantidad, slot,
                doc["task"]["paciente"].as<const char*>(), doc["task"]["tarjeta"].as<const char*>());

  if (id == prefs.getString("ultimaGirada", "")) {
    // La API la reenvió porque no le llegó la confirmación: ya se giró, no repetir la dosis
    Serial.println("Ya se había dispensado; solo se confirma");
  } else {
    // Sin servo para ese compartimento no se confirma: la API la da por perdida tras 3 intentos
    if (!dispensar(slot, cantidad)) return;
    prefs.putString("ultimaGirada", id);
  }
  guardarSinConfirmar(id);
  confirmar(id);
}

void conectarWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando WiFi");
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? " listo" : " sin conexión");
}

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < NUM_SERVOS; i++) {
    servos[i].attach(SERVO_PINS[i]);
    servos[i].write(ANGULO_REPOSO);
  }
  prefs.begin("dosicare", false);
  tomaSinConfirmar = prefs.getString("sinConfirmar", "");
  conectarWiFi();
}

void loop() {
  conectarWiFi();
  if (WiFi.status() == WL_CONNECTED) consultarTarea();
  delay(POLL_MS);
}
