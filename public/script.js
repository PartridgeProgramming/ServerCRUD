const getRockets = async() => {
    try {
        return (await fetch("api/rockets/")).json();
    } catch (error) {
        console.log(error);
    }
};

const showRockets = async() => {
    let rockets = await getRockets();
    let rocketsDiv = document.getElementById("rocket-list");
    rocketsDiv.innerHTML = "";
    rockets.forEach((rocket) => {
        const section = document.createElement("section");
        section.classList.add("rocket");
        rocketsDiv.append(section);

        const a = document.createElement("a");
        a.href = "#";
        section.append(a);

        const h3 = document.createElement("h3");
        h3.innerHTML = rocket.name;
        a.append(h3);

        const img = document.createElement("img");
        img.src = "images/" + rocket.img;
        img.width = 150;
        img.height = 150;
        section.append(img);

        a.onclick = (e) => {
            e.preventDefault();
            displayDetails(rocket);
        };
    }); 
};

const displayDetails = (rocket) => {
    const rocketDetails = document.getElementById("rocket-details");
    rocketDetails.innerHTML = "";

    const h3 = document.createElement("h3");
    h3.innerHTML = rocket.name;
    rocketDetails.append(h3);

    const dLink = document.createElement("a");
    dLink.innerHTML = "	&#x2715;";
    rocketDetails.append(dLink);
    dLink.id = "delete-link";

    const eLink = document.createElement("a");
    eLink.innerHTML = "&#9998;";
    rocketDetails.append(eLink);
    eLink.id = "edit-link";

    const p = document.createElement("p");
    rocketDetails.append(p);
    p.innerHTML = `Company: ${rocket.company}<br>`;
    p.innerHTML += `Payload capacity: ${rocket.payload_capacity_kg}kg<br>`;
    p.innerHTML += `Propellant type: ${rocket.propellant_type}<br>`;
    p.innerHTML += `Number of successful launches: ${rocket.successful_launches}<br>`;
    p.innerHTML += `Launch sites:<br>`;

    const ul = document.createElement("ul");
    rocketDetails.append(ul);
    rocket.launch_sites.forEach((site) => {
        const li = document.createElement("li");
        ul.append(li);
        li.innerHTML = site;
    });

    eLink.onclick = (e) => {
        e.preventDefault();
        document.querySelector(".dialog").classList.remove("transparent");
        document.getElementById("add-edit-title").innerHTML = "Edit Rocket";
    };

    dLink.onclick = (e) => {
        e.preventDefault();
        deleteRocket(rocket);
    };

    populateEditForm(rocket);
};

const deleteRocket = async(rocket) => {
    let response = await fetch (`/api/rockets/${rocket._id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
            }
        });
    
    if (response.status != 200) {
        console.log("There was an error with trying to delete.");
        return;
    }

    let result = await response.json();
    showRockets();
    document.getElementById("rocket-details").innerHTML = "";
    resetForm();
};

const populateEditForm = (rocket) => {
    const form = document.getElementById("add-edit-rocket-form");
    form._id.value = rocket._id;
    form.name.value = rocket.name;
    form.company.value = rocket.company;
    form.payload_capacity_kg.value = rocket.payload_capacity_kg;
    form.propellant_type.value = rocket.propellant_type;
    form.successful_launches.value = rocket.successful_launches;
    populateLaunchSite(rocket);
};

const populateLaunchSite = (rocket) => {
    const section = document.getElementById("site-boxes");

    rocket.launch_sites.forEach((site) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = site;
        section.append(input);
    });
};

const addEditRocket = async (e) => {
    e.preventDefault();
    const form = document.getElementById("add-edit-rocket-form");
    const formData = new FormData(form);
    let response;
    formData.append("launch_sites", getSites());

    // trying to add a new rocket
    if (form._id.value == -1) {
        formData.delete("_id");

        response = await fetch("/api/rockets", {
            method: "POST",
            body: formData
        });
    }
    // editing an existing rocket
    else {
        console.log(...formData);

        response = await fetch(`/api/rockets/${form._id.value}`, {
            method: "PUT",
            body: formData
        });
    }

    // did not get data from server
    if (response.status != 200) {
        console.log("Error posting data");
    } 

    rocket = await response.json();

    if (form._id.value != -1) {
        displayDetails(rocket);
    }

    resetForm();
    document.querySelector(".dialog").classList.add("transparent");
    showRockets();
};

const getSites = () => {
    const inputs = document.querySelectorAll("#site-boxes input");
    let sites = [];

    inputs.forEach((input) => {
        sites.push(input.value);
    });

    return sites;
};

const resetForm = () => {
    const form = document.getElementById("add-edit-rocket-form");
    form.reset();
    form._id = "-1";
    document.getElementById("site-boxes").innerHTML = "";
};

const showHideAdd = (e) => {
    e.preventDefault();
    document.querySelector(".dialog").classList.remove("transparent");
    document.getElementById("add-edit-title").innerHTML = "Add Rocket";
    resetForm();
};

const addSite = (e) => {
    e.preventDefault();
    const section = document.getElementById("site-boxes");
    const input = document.createElement("input");
    input.type = "text";
    section.append(input);
};

window.onload = () => {
    showRockets();
    document.getElementById("add-edit-rocket-form").onsubmit = addEditRocket;
    document.getElementById("add-link").onclick = showHideAdd;

    document.querySelector(".close").onclick = () => {
        document.querySelector(".dialog").classList.add("transparent");
    };

    document.getElementById("add-site").onclick = addSite;
};