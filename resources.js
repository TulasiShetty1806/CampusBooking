const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// Get all resources
router.get('/', authenticate, (req,res)=>{
    db.query("SELECT * FROM resources", (err,result)=>{
        if(err) return res.status(500).send(err);
        res.send(result);
    });
});

// Add resource (Admin only)
router.post('/', authenticate, (req,res)=>{
    if(req.user.role!=='admin') return res.status(403).send({message:'Forbidden'});
    const {name,type,description} = req.body;
    db.query("INSERT INTO resources (name,type,description) VALUES (?,?,?)",[name,type,description],(err,result)=>{
        if(err) return res.status(500).send(err);
        res.send({message:'Resource added'});
    });
});

module.exports = router;
