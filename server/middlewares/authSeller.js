import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.json({
      success: false,
      message: "Not Authorized"
    });
  }

  try {
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);

    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      // Authorized seller
      return next();   // ✅ yahi pe next call karo
    } else {
      return res.json({
        success: false,
        message: "Not authorized"
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Invalid Token"
    });
  }
};

export default authSeller;
