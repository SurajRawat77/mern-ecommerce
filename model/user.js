const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    email:{type:String},
    password:{type:String,required:true}, // if we use session based authentication then we can store password as string but if we use jwt based authentication then we should store password as buffer because we will hash the password and store it in database and then compare it with the hashed password when user tries to login.
    role:{type:String,required:true,default:'user'},
    addresses:{type:[Schema.Types.Mixed]},
    name:{type:String},
    orders:{type:[Schema.Types.Mixed]},
    salt:Buffer
    
   
})

const virtual = userSchema.virtual("id");

virtual.get(function(){
    return this._id;
})
userSchema.set("toJSON",{
    virtuals:true,
    versionKey:false,
    transform:function(doc,ret) {delete ret._id}
})

exports.User = mongoose.model('User',userSchema);