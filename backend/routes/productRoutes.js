const express =require("express")
const Product = require("../models/Product")
const {authMiddleware,verifyAdmin,verifySellerRole} = require("../middleware/authMiddleware")
// const { verifySellerRole } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");


const router= express.Router()
router.post("/add",authMiddleware,verifyAdmin,async (req,res)=>{
    try{
        const {name,description,price,category,stock,imageUrl}=req.body
        if(!name||!description||!price||!category||!stock||!imageUrl){
            return res.status(400).json({"message":"All fields are needed at the time of adding products"})
        }
        const newProduct=new Product({
            name, description,price,category,stock,imageUrl,createdBy:req.user.id
        })
        await newProduct.save()
        return res.status(201).json({"message":"Product added successfully"})
    }
    catch(err){
        console.log("error from product routes",err)
        return res.status(500).json({"message":"server error in productroutes"})
    }
})

router.get("/",async(req,res)=>{
    try{
        const products=await Product.find()
        res.json(products)
    }
    catch(err){
        return res.status(500).json({"message":"server error from fetch products"})
    }
})

router.get("/seller", authMiddleware, verifySellerRole, async (req, res) => {
    try {
      const sellerId = req.user.id;
      //console.log(sellerId)  // Use _id here instead of id
      const products = await Product.find({ createdBy: new mongoose.Types.ObjectId(sellerId) });  
      if (!products || products.length === 0) {
        return res.status(404).json({ message: "No products found for this seller." });
    }
// Fetch products by seller
      res.status(200).json(products);  // Return the seller's products
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ message: "Error fetching seller's products" });
    }
  });

  router.delete("/:id",authMiddleware,verifyAdmin,async (req,res)=>{
    try{
        const product= await Product.findById(req.params.id)
        if(!product)
                return res.status(404).json({"message":"Product not found"})
        await product.deleteOne()
        return res.status(200).json({"message":"Product Deleted successfully"})
    }
    catch(err){
        return res.status(500).json({"message":"Server error from dlete product"})
    }
})

module.exports=router