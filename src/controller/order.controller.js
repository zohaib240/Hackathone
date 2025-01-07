import Order from "../model/orders.models.js";
import Product from "../model/products.models.js";  


const placeOrder = async (req, res) => {
    const { user, products } = req.body; 
    try {
        if (!user || !products || products.length === 0) {
            return res.status(400).json({ message: "User and product details are required." });
        }
        const productDetails = await Product.find({ _id: { $in: products.map(p => p.productId) } });
        if (!productDetails.length) {
            return res.status(404).json({ message: "Products not found!" });
        }
        let totalPrice = 0;
        const productsWithSubtotal = products.map((item) => {
            const product = productDetails.find((p) => p._id.toString() === item.productId.toString());
            const subTotal = product.price * item.quantity;  // Calculate subtotal for each product
            totalPrice += subTotal;  // Add to totalPrice
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                subTotal: subTotal
            };
        });

        const order = new Order({
            user,
            products: productsWithSubtotal,
            totalPrice,
            status: "pending"  // Default status
        });

        await order.save();
        res.status(201).json({
            message: "Order placed successfully!",
            order
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while placing the order!" });
    }
};

// Get all orders  ----->>>>>> 

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').populate('products.productId', 'name price');
        if (!orders.length) {
            return res.status(404).json({ message: "No orders found!" });
        }
        res.status(200).json({
            message: "Orders fetched successfully!",
            orders
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while fetching orders!" });
    }}



// Get single order by ID    ----->>>>>> 

const getSingleOrder = async (req, res) => {
    const { orderId } = req.params;  // Get orderId from request params
    console.log("Received Order ID:", orderId);

    try {
        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('products.productId', 'name price');
        if (!order) {
            return res.status(404).json({ message: "Order not found!" });
        }
        res.status(200).json({
            message: "Order fetched successfully!",
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while fetching the order!" });
    }
};

export { placeOrder, getAllOrders ,getSingleOrder } ;


