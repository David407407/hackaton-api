import { useState } from "react"

class Patient {
    static count = 0;
    constructor(name, age, gender, pills = "") {
        Patient.count++;
        this.id = Patient.count;
        this.name = name;
        this.gender = gender;
        this.age = age;
        this.pills = pills;
    }
}

function getPatientList() {
    return [
        new Patient("Juan", "19", "Hombre"),
        new Patient("Toño", "33", "Hombre")
    ];
}

function TextInput({text, setText}) {
    return <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter some text..."
      />
}

function AddPatientForm({onSubmitAddPatient}) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [pills, setPills] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault() 
    if (!isFormCompleted([name, age, gender, pills])) return;

    onSubmitAddPatient(name, age, gender, pills);
    setName('')
    setAge('')
    setGender('')
    setPills('')
  }

  const isFormCompleted = (textFields) => {
    const isEmpty = (text) => text == "";
    return textFields.every((text) => !isEmpty(text));
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Nombre</p>
      <TextInput text={name} setText={setName}></TextInput>
      <p>Edad</p>
      <TextInput text={age} setText={setAge}></TextInput>
      <p>Genero</p>
      <TextInput text={gender} setText={setGender}></TextInput>
      <p>Pastillas</p>
      <TextInput text={pills} setText={setPills}></TextInput>
      <button type="submit">Submit</button>
    </form>
  )
}

function PatientDashboard() {
    const [patientList, setPatientList] = useState(getPatientList());
    const [nameInput, setNameInput] = useState("");
    
    const addPatient = (name, age, gender, pills) => {
        let newId = patientList.length + 1;
        let newPatient = new Patient(name, age, gender, pills);

        setPatientList([...patientList, newPatient]);
    }

return <>
    <h1>Pacientes</h1>
    {
        patientList.map(patient => (
            <li key={patient.id}>
                <p>Nombre: {patient.name}</p>
                <p>Edad: {patient.age}</p>
                <p>Genero: {patient.gender}</p>
            </li>
        ))
    }

    <div name="AddPatient">
        <h1>Agregar paciente</h1>
        <AddPatientForm onSubmitAddPatient={addPatient}></AddPatientForm>
    </div>
</>
}

export default PatientDashboard