import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
    {
        fullName:{
            type:String,
            required: [true, "Name is required"],
        },
        email:{
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [/^[\w-\.]+@diu\.edu\.bd$/, "Please use a valid DIU email address"],
        }
    },
    {
        timestamps: true,
    }
)

export const User = mongoose.model("User", userSchema)