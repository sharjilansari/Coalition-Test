import { username, password, apiUrl } from "./credentials.js";

document.addEventListener("DOMContentLoaded", function () {
  const patientList = document.getElementById("patient-list");

  const auth = btoa(`${username}:${password}`);

  // Fetch data from the API
  fetch(apiUrl, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      const patients = data;
      populatePatientList(patients);
      // Optionally display the first patient's data by default
      displayPatientDetails(patients[0]);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  function populatePatientList(patients) {
    patients.forEach((patient, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
      <div class="list_main_container">
      <img src=${patient.profile_picture} />
      <div class="list_second_container">
      <span class="patient_name"> ${patient.name}</span>
      <span class="patient_detail"> ${patient.gender}, ${patient.age}</span>
      </div>
      </div>
      `;
      li.addEventListener("click", () => displayPatientDetails(patient));
      patientList.appendChild(li);
    });
  }

  function displayPatientDetails(patient) {
    const patient_name = document.getElementById("patient_name");
    const patient_DOB = document.getElementById("patient_DOB");
    const patient_gender = document.getElementById("patient_gender");
    const patient_contact = document.getElementById("patient_contact");
    const patient_Econtact = document.getElementById("patient_Econtact");
    const patient_insurance = document.getElementById("patient_insurance");
    const patient_img = document.getElementById("patient_img");

    patient_name.textContent = patient.name;
    patient_DOB.textContent = patient.date_of_birth;
    patient_gender.textContent = patient.gender;
    patient_contact.textContent = patient.phone_number;
    patient_Econtact.textContent = patient.emergency_contact;
    patient_insurance.textContent = patient.insurance_type;
    patient_img.src = patient.profile_picture;

    updateChart(patient);
    Diagnostics(patient);
  }

  let bloodPressureChart; // Declare the chart variable at a higher scope

  function updateChart(patient) {
    // Extracting data for the chart
    const labels = patient.diagnosis_history.map(
      (entry) => `${entry.month}, ${entry.year}`
    );
    const systolicData = patient.diagnosis_history.map(
      (entry) => entry.blood_pressure.systolic.value
    );
    const diastolicData = patient.diagnosis_history.map(
      (entry) => entry.blood_pressure.diastolic.value
    );

    // Update the values for systolic and diastolic blood pressure
    const systolic = document.getElementById("systolic");
    const diastolic = document.getElementById("diastolic");
    systolic.textContent = systolicData[0];
    diastolic.textContent = diastolicData[0];

    // Destroy the previous chart instance if it exists
    if (bloodPressureChart) {
      bloodPressureChart.destroy();
    }

    // Get the context for the new chart
    const ctx = document.getElementById("bloodPressureChart").getContext("2d");
    bloodPressureChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Systolic",
            data: systolicData,
            borderColor: "rgb(255, 99, 132)",
            fill: false,
          },
          {
            label: "Diastolic",
            data: diastolicData,
            borderColor: "rgb(54, 162, 235)",
            fill: false,
          },
        ],
      },
      options: {},
    });
  }

  function Diagnostics(patientData) {
    const latestData = patientData.diagnosis_history[0];

    document.getElementById(
      "respiratory-value"
    ).innerText = `${latestData.respiratory_rate.value} bpm`;
    document.getElementById("respiratory-levels").innerText =
      latestData.respiratory_rate.levels;

    document.getElementById(
      "temperature-value"
    ).innerText = `${latestData.temperature.value}°F`;
    document.getElementById("temperature-levels").innerText =
      latestData.temperature.levels;

    document.getElementById(
      "heart-value"
    ).innerText = `${latestData.heart_rate.value} bpm`;
    document.getElementById("heart-levels").innerText =
      latestData.heart_rate.levels;

    const diagnosticListBody = document.getElementById("diagnostic-list-body");
    diagnosticListBody.innerHTML = ""; // Clear existing rows
    patientData.diagnostic_list.forEach((diagnostic) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${diagnostic.name}</td>
            <td>${diagnostic.description}</td>
            <td>${diagnostic.status}</td>
        `;
      diagnosticListBody.appendChild(row);
    });

    const labResultsList = document.getElementById("lab-results-list");
    labResultsList.innerHTML = ""; // Clear existing items
    patientData.lab_results.forEach((result) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
            <span>${result}</span>
            <span class="download"><img src="img/download_FILL0_wght300_GRAD0_opsz24 (1).png" alt="Download icon" /></span>
        `;
      labResultsList.appendChild(listItem);
    });
  }
});
