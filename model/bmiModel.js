const mongoose = require("mongoose")

const bmiSchema = new mongoose.Schema({
    BMI: {type:Number, required: true},
    height:{type:String,required: true},
    weight: {type:String,required: true},
    user_id: {type:String, required:true}
},{
    timestamps:true
})

const BmiModel = mongoose.model("bmi",bmiSchema)

module.exports= {BmiModel}