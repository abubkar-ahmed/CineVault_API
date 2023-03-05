const User = require('../model/User')
const bcrypt = require('bcrypt');
const byteSize = require('byte-size');


const handleNewUser = async (req , res) => {
    const {email , pwd , rPwd} = req.body ;
    if (!email || !pwd || !rPwd) return res.status(400).json({
        'message' : 'All Fileds Are Required.',
    })

    
    const rgxEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if(!rgxEmail.test(email)) return res.status(409).json({
        'message' : 'Invalied Email'
    })

    const duplicatedemail = await User.findOne({email : email}).exec();

    if(duplicatedemail) return res.status(409).json({'message' : 'Email is Already Registerd'});
    if(pwd !== rPwd) return res.status(409).json({
        'message' : 'Password Must Be same As Repeated Password'
    })


    try{
        const newUser = new User({});
        if(req?.files?.img){
            const acceptedType = ['image/png', 'image/jpg', 'image/jpeg' , 'image/webp'] ;
            const img = req.files.img ;
            if(!acceptedType.includes(img?.mimetype)) {
                return res.status(400).json({
                    'message' : 'invalied Image Type'
                })
            }
            const size = byteSize(img.size);

            if(size.unit === 'MB' && size.value > 5){
                return res.status(400).json({
                    'message' : 'Max Size For Image Is 5MB'
                })
            }
            if(size.unit === 'kB' || size.unit === 'MB'){
                saveImage(newUser, img);
            }else {
                return res.status(400).json({
                    'message' : 'Max Size For Image Is 5MB'
                })
            }
        }

        function saveImage(newUser, imgEncoded) {
            const img = imgEncoded;
            newUser.img = new Buffer.from(img.data, "base64");
            newUser.imgType = img.mimetype;

        }

        const hashPassword = await bcrypt.hash(pwd , 10);

        newUser.email = email ;
        newUser.password = hashPassword;

        
        const result = await newUser.save();
        return res.status(201).json({'success' : `New User ${email} Created`});
        
    }catch (err) {
        console.log(err)
        return res.status(500).json({'message' : `${err}`})
    }

}




module.exports = {handleNewUser}