import fs from "fs"
import { v2 as cloudinary } from "cloudinary";
import User from '../model/users.model.js'
import productModel from "../model/products.models.js";
import mongoose from "mongoose";


// cloudinary image upload k lye

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });
  
// user post data ----->>>>>> 

const addProduct = async (req,res) =>{
    const {name,description,user,price} = req.body

    if (!name || !description || !user || !price) {
        return res.status(400).json({ error: "title or description or posted by required" });
      }   

try {
   // Check if the user is registered
   const postUser = await User.findById(user); // Verify user by their ID
   if (!postUser) {
     return res.status(404).json({ message: "User not found. Please register to post." });
   }
    if (!req.file) {
        return res.status(400).json({ error: "Profile image is required" });
      }
      const Image = req.file.path;
      console.log(Image);
//    upload image on  cloudinary and response url from cloudinary
      const postImage = await uploadImageToCloudinary(Image);
      console.log(postImage);

      const createPosts = await productModel.create({
        name,
        description,
        postImage,
        user,
        price
      });
      res.json({
        message: "product add successfully",
        data: createPosts,
      });
    
} catch (error) {
    res.status(500).json({ error: error.message });

}
}

// image upload on cloudinary  ----->>>>>> 

const uploadImageToCloudinary = async (localpath) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto", // Automatically detect image/video type
    });
    if (uploadResult) {
      await fs.promises.unlink(localpath);  // Asynchronous file deletion
    }

    return uploadResult.url; // Return the image URL from Cloudinary
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Error uploading image to Cloudinary");  // Custom error message
  }
};
//  delete image on cloudinary ------>>>>

const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;  // Delete hone ke baad result return karo, jo ki aap log kar sakte hain
  } catch (error) {
    throw new Error('Error deleting image from Cloudinary: ' + error.message);
  }
};

// get singleProduct ----->>>

const singleProduct = async (req, res) => {
  const {id} =req.params
  if (!id) {
    return res.status(400).json({ error: "Post ID required" });
  }
  try {
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "no product found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.log(error.message || error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};




  // get allProduct ----->>>

const allProducts = async (req, res) => {
  const page = req.query?.page || 1; // Default page is 1
  const limit = req.query?.limit || 10; // Default limit is 10
  const skip = (page - 1) * limit;

  try {
    const products = await productModel.find({}).skip(skip).limit(+limit);
    if (products.length === 0) {
      return res.status(200).json({ message: "No products left!" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.log(error.message || error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};


// deleteProduct ----->>>>>

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { user } = req.body;  // User ID body se aa rahi hai
  if (!id || !user) {
    return res.status(400).json({ error: "Post ID aur user ID required hain" });
  }
  try {
    const post = await productModel.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post nahi mila" });
    }
    if (post.user.toString() !== user) {
      return res.status(403).json({ error: "this is not your post" });
    }
    await deleteImageFromCloudinary(post.postImage);
    await productModel.findByIdAndDelete(id);

    res.json({ message: "Post successfully delete " });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 
// update product  ----->>>>>> 

const updateProduct = async (req, res) => {
  const user = req.user; // The logged-in user
  const { id: productId } = req.params;
  const { name, description, price } = req.body;
  const mediaPath = req.file ? req.file.path : null; // Check if file is uploaded
  console.log("Body:", req.body); // Debugging line to check request body
  console.log("File:", req.file);
  try {
      // Ensure at least one field is provided for update
      if (!name && !description && !price && !mediaPath) {
          return res.status(400).json({ message: "At least update one field!" });
      }

      // Validate productId
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({
              message: "Product Id is required and must be valid!"
          });
      }
      const product = await productModel.findById(productId);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      if (product.user.toString() !== user._id.toString()) {
          return res.status(403).json({
              message: "You are not authorized to edit this product!"
          });
      }

      // Handle image upload if mediaPath is provided
      let media = product.image;
      if (mediaPath) {
          try {
              media = await uploadImageToCloudinary(mediaPath);
          } catch (error) {
              return res.status(500).json({ message: "Failed to upload image!" });
          }
      }

      // Update product fields
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.image = media;

      // Save the updated product
      await product.save();

      return res.status(200).json({
          message: "Product updated successfully!",
          product,
      });

  } catch (error) {
    console.log(error); // Log the complete error
    return res.status(500).json({
      message: "Something went wrong while editing the product!",
      error: error.message, // Add detailed error message
    });
  }
};

  export  {addProduct,allProducts,deleteProduct,updateProduct,singleProduct}