const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
 .connect("mongodb://localhost/rockets")
 .then(() => console.log("Connected to mongodb..."))
 .catch((error) => console.log("Couldn't connect to mongodb...", error));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const rocketSchema = new mongoose.Schema({
    name: String,
    company: String,
    payload_capacity_kg: Number,
    propellant_type: String,
    successful_launches: Number,
    launch_sites: [String],
    img: String,
});

const Rocket = mongoose.model("Rocket", rocketSchema);

app.get("/api/rockets", (req, res) => {
    getRockets(res);
});

const getRockets = async (res) => {
    const rockets = await Rocket.find();
    res.send(rockets);
};

app.post("/api/rockets", upload.single("img"), (req, res) => {
    const result = validateRocket(req.body);
    console.log(result);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const rocket = new Rocket({
        name: req.body.name,
        company: req.body.company,
        payload_capacity_kg: req.body.payload_capacity_kg,
        propellant_type: req.body.propellant_type,
        successful_launches: req.body.successful_launches,
        launch_sites: req.body.launch_sites.split("."),
    });

    if (req.file) {
        rocket.img = "images/" + req.file.filename;
    }

    createRocket(rocket, res);
});

const createRocket = async (rocket, res) => {
    const result = await rocket.save();
    res.send(rocket);
};

app.put("/api/rockets/:id", upload.single("img"), (req, res) => {
    const result = validateRocket(req.body);
    console.log(result);
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    updateRocket(req, res);
});

const getRocket = async(res, id) => {
    const rocket = await Rocket.findOne({_id:id});
    res.send(rocket);
};



const updateRocket = async (req, res) => {
    let fieldToUpdate = {
        name: req.body.name,
        company: req.body.company,
        payload_capacity_kg: req.body.payload_capacity_kg,
        propellant_type: req.body.propellant_type,
        successful_launches: req.body.successful_launches,
        launch_sites: req.body.launch_sites.split("."),
    };

    if (req.file) {
        fieldToUpdate.img = "images/" + req.file.filename;
    }

    const result = await Rocket.updateOne({_id:req.params.id}, fieldToUpdate);
    const rocket = await Rocket.findById(req.params.id);
    res.send(rocket);
};

app.delete("/api/rockets/:id", upload.single("img"), (req, res) => {
   removeRockets(res, req.params.id);
});

const removeRockets = async(res, id) => {
    const rocket = await Rocket.findByIdAndDelete(id);
    res.send(rocket);
};

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