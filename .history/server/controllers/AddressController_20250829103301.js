import Address from "../models/Address.js";

//api/address/add//
export const addAddress = async (req, res) => {
  try {
    const { address, userId } = req.body;
    await Address.create({ ...address, userId });
    res.json({
      success: true,
      message: "Address added",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: "Adress not added",
    });
  }
};

//get address//
export const getAddress = async (req, res) => {
  try {
   const userId = req.user._id;  
    const addresses = await Address.find({ userId });
    console.log(addresses)
    res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: "Adress not added nikal",
    });
  }
};
