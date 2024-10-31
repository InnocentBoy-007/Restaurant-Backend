import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    gender:{
        type:Boolean,
        required:true
    },
    age:{
        type:Number,
        reqired:true
    },
    position:{
        type:String,
        required:true
    }
})

const user = mongoose.model("users", userSchema);
export default {user};
