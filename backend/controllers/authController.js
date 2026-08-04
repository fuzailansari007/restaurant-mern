import User from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"


//generate token
const generateToken = (res,payload) => {
  const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"1d"});
  res.cookie("token",token,{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"strict",
    maxAge:24*60*60*1000
  });
  return token;
}

//register user
export const registerUser = async(req,res)=>{
  try{
    //check if all fields are filled
    const{name,email,password} = req.body;
    if(!name || !email || !password){
      return res.json({message:"Please fill all the fields",success:false});
    }

    //check if user already exists
    const existingUser=await User.findOne({email});
    if(existingUser){
      return res.json({message:"User already exists",success:false});
    }
    const hashPassword = await bcrypt.hash(password,10);

    //user registeration
    const user=await User.create({name,email,password:hashPassword })
    return res.json({message:"User registered successfully",success:true,user});

  }catch(error){
    console.log(error.message);
    return res.json({message:"Internal server error",success:false});
  }
}

//login user
export const loginUser = async(req,res)=>{
  try{
    //check if all fields are filled
    const {email,password} = req.body;
    if(!email || !password){
      return res.json({message:"Please fill all the fields",success:false});
    }

    //check if user exists
    const user = await User.findOne({email});
    if(!user){
      return res.json({message:"User does not exist",success:false});
    }

    //check if password is correct
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.json({message:"Invalid credentials",success:false});
    }

    //generate token and send response
    const token = generateToken(res,{id:user._id,role:user.isAdmin?"admin":"user"});
    return res.json({
      message:"User logged in successfully",
      success:true,
      user:{
        _id:user._id,
        name:user.name,
        email:user.email,
        isAdmin:user.isAdmin,
        token
      }
    });


  }catch(error){
    console.log(error.message);
    return res.json({message:"Internal server error",success:false});
  }
}

//admin login
export const adminLogin = async(req,res)=>{
  try{
    //check if the admin credentials are correct
    const {email,password} = req.body;
    if(email!==process.env.ADMIN_EMAIL || password!==process.env.ADMIN_PASSWORD){
      return res.json({message:"Invalid credentials",success:false});
    }

    //generate token and send response
    const token = jwt.sign({email},process.env.JWT_SECRET,{
      expiresIn:"1d"
    });

    res.cookie("token",token,{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:"strict",
      maxAge:24*60*60*1000
    });

    return res.json({message:"Admin logged in successfully",success:true,token})
  }catch (error) {
      console.log(error.message);
      return res.json({message:"Internal server error",success:false});
    }
}

//logout user
export const logoutUser = (req,res)=>{
  try{
    res.clearCookie("token");
    return res.json({message:"User logged out successfully",success:true});
  }catch(error){
    console.log(error.message);
    return res.json({message:"Internal server error",success:false});
  }
}

