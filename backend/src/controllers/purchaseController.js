import Purchase from '../models/Purchase.js';
import Prompt from '../models/Prompt.js';
import User from '../models/User.js';

// Get user's purchased prompts
export const getPurchasedPrompts = async (req, res) => {
  try {
    const purchases = await Purchase.find({ 
      user: req.user.id, 
      paymentStatus: 'completed' 
    })
    .populate('prompt')
    .sort({ purchaseDate: -1 });

    const purchasedPrompts = purchases.map(purchase => ({
      ...purchase.prompt.toObject(),
      purchaseDate: purchase.purchaseDate,
      downloadCount: purchase.downloadCount,
      lastDownloaded: purchase.lastDownloaded,
      purchaseId: purchase._id
    }));

    res.json(purchasedPrompts);
  } catch (error) {
    console.error('Get purchased prompts error:', error);
    res.status(500).json({ message: 'Server error while fetching purchased prompts' });
  }
};

// Purchase a prompt (simulate payment)
export const purchasePrompt = async (req, res) => {
  try {
    const { promptId } = req.params;
    const { paymentMethod = 'stripe' } = req.body;

    // Check if prompt exists and is paid
    const prompt = await Prompt.findById(promptId);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    if (prompt.price <= 0) {
      return res.status(400).json({ message: 'This prompt is free and cannot be purchased' });
    }

    // Check if user already purchased this prompt
    const existingPurchase = await Purchase.findOne({
      user: req.user.id,
      prompt: promptId
    });

    if (existingPurchase && existingPurchase.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'You have already purchased this prompt' });
    }

    // Check if user is trying to buy their own prompt
    if (prompt.author.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot purchase your own prompt' });
    }

    // Create purchase record
    const purchase = new Purchase({
      user: req.user.id,
      prompt: promptId,
      amount: prompt.price,
      paymentStatus: 'completed', // Simulating successful payment
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    await purchase.save();

    // Update prompt sales count
    await Prompt.findByIdAndUpdate(promptId, {
      $inc: { sales: 1 }
    });

    // Populate the prompt data for response
    await purchase.populate('prompt');

    res.status(201).json({
      message: 'Purchase successful!',
      purchase: {
        id: purchase._id,
        prompt: purchase.prompt,
        amount: purchase.amount,
        purchaseDate: purchase.purchaseDate,
        paymentStatus: purchase.paymentStatus
      }
    });
  } catch (error) {
    console.error('Purchase prompt error:', error);
    res.status(500).json({ message: 'Server error during purchase' });
  }
};

// Download a purchased prompt
export const downloadPrompt = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const purchase = await Purchase.findOne({
      _id: purchaseId,
      user: req.user.id,
      paymentStatus: 'completed'
    }).populate('prompt');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found or not completed' });
    }

    // Update download count and last downloaded date
    await Purchase.findByIdAndUpdate(purchaseId, {
      $inc: { downloadCount: 1 },
      lastDownloaded: new Date()
    });

    // Return prompt data for download
    res.json({
      message: 'Download successful',
      prompt: {
        title: purchase.prompt.title,
        description: purchase.prompt.description,
        prompt: purchase.prompt.prompt,
        category: purchase.prompt.category,
        tags: purchase.prompt.tags,
        image: purchase.prompt.image,
        author: purchase.prompt.author,
        downloadCount: purchase.downloadCount + 1,
        lastDownloaded: new Date()
      }
    });
  } catch (error) {
    console.error('Download prompt error:', error);
    res.status(500).json({ message: 'Server error during download' });
  }
};

// Check if user has purchased a specific prompt
export const checkPurchaseStatus = async (req, res) => {
  try {
    const { promptId } = req.params;

    const purchase = await Purchase.findOne({
      user: req.user.id,
      prompt: promptId,
      paymentStatus: 'completed'
    });

    res.json({
      hasPurchased: !!purchase,
      purchase: purchase ? {
        id: purchase._id,
        purchaseDate: purchase.purchaseDate,
        downloadCount: purchase.downloadCount
      } : null
    });
  } catch (error) {
    console.error('Check purchase status error:', error);
    res.status(500).json({ message: 'Server error while checking purchase status' });
  }
};
