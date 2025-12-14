
import jwt from 'jsonwebtoken';
const authUser = async(req,res,next)=>{
const {token} = req.cookies;
if (!token) {
  return res.status(401).json({
    success: false,
    message: "Not Authorized"
  });
}

try {
  const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
  if(tokenDecode.id){
    req.user = { _id: tokenDecode.id };      

  }else{
    return res.json({
      success: false,
      message: "Not authorized"
    })
  }
  next();
} catch (error) {
  res.json({
    success: false,
    message: "Invalid Token"
  })
}
}



export default authUser;