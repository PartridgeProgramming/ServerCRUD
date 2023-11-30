const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());

const upload = multer({ dest: __dirname + "/public/images" });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let rockets = [{
        _id: 1,
        name: "Falcon Heavy",
        company: "SpaceX",
        payload_capacity_kg: 63800,
        propellant_type: "liquid",
        successful_launches: 4,
        img: "falcon_heavy.jpg",
        launch_sites: ["Kennedy Space Center",
        "Vandenberg Space Force Base"],
    },
    {
        _id: 2,
        name: "Atlas V",
        company: "United Launch Alliance",
        payload_capacity_kg: 20600,
        propellant_type: "liquid",
        successful_launches: 86,
        img: "atlas_v.jpg",
        launch_sites: ["Cape Canaveral Space Force Station",
        "Vandenberg Space Force Base"]
    },
    {
        _id: 3,
        name: "Delta IV Heavy",
        company: "United Launch Alliance",
        payload_capacity_kg: 28800,
        propellant_type: "liquid",
        successful_launches: 12,
        img: "delta_iv_heavy.jpg",
        launch_sites: ["Cape Canaveral Space Force Station"]
    },
    {
        _id: 4,
        name: "SLS",
        company: "NASA",
        payload_capacity_kg: 95000,
        propellant_type: "liquid",
        successful_launches: 0,
        img: "sls.jpg",
        launch_sites: ["Kennedy Space Center"]
    },
    {
        _id: 5,
        name: "New Glenn",
        company: "Blue Origin",
        payload_capacity_kg: 45000,
        propellant_type: "liquid",
        successful_launches: 0,
        img: "new_glenn.jpg",
        launch_sites: ["Cape Canaveral Space Force Station"]
    },
    {
        _id: 6,
        name: "Starship",
        company: "SpaceX",
        payload_capacity_kg: 100000,
        propellant_type: "liquid",
        successful_launches: 0,
        img: "starship.jpg",
        launch_sites: ["Boca Chica, Texas"]
}];

app.get("/api/rockets", (req, res) => {
    res.send(rockets);
});

app.post("/api/rockets", upload.single("img"), (req, res) => {
	console.log(req.body);
    const result = validateRocket(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const rocket = {
        _id: rockets.length + 1,
        name: req.body.name,
        company: req.body.company,
        payload_capacity_kg: req.body.payload_capacity_kg,
        propellant_type: req.body.propellant_type,
        successful_launches: req.body.successful_launches,
        launch_sites: req.body.launch_sites.split(".")
    }

    if (req.file) {
        rocket.img = "images/" + req.file.filename;
    }

    rockets.push(rocket);
    res.send(rockets);
});

app.put("/api/rockets/:id", upload.single("img"), (req, res) => {
    const id = parseInt(req.params.id);

    const rocket = rockets.find((r) => r._id === id);

    const result = validateRocket(req.body);
    
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    rocket.name = req.body.name;
    rocket.company = req.body.company;
    rocket.payload_capacity_kg = req.body.payload_capacity_kg;
    rocket.propellant_type = req.body.propellant_type;
    rocket.successful_launches = req.body.successful_launches;
    rocket.launch_sites = req.body.launch_sites.split(".");
    
    if (req.file) {
        rocket.img = "images/" + req.file.filename;
    }

    res.send(rocket);
});

app.delete("/api/rockets/:id", upload.single("img"), (req, res) => {
    const id = parseInt(req.params.id);

    const rocket = rockets.find((r) => r._id === id);

    if (!rocket) {
        res.status(404).send("The rocket was not found");
        return;
    }

    const index = rockets.indexOf(rocket);
    rockets.splice(index, 1);
    res.send(rocket);

});

const validateRocket = (rocket) => {
    const schema = Joi.object({
        _id: Joi.number().allow(''),
        name: Joi.string().min(3).required(),
        company: Joi.string().min(5).required(),
        payload_capacity_kg: Joi.number().positive().required(),
        propellant_type: Joi.string().min(3).required(),
        successful_launches: Joi.number().required(),
        launch_sites: Joi.allow("")
    });

    return schema.validate(rocket);
};


app.listen(3000, () => {
    console.log("Server started.")
});