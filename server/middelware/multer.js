import multer from 'multer'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const upload = multer({storage})

export const uploadSingle = upload.single("image")

// ✅ allow max 5 images
export const uploadMultiple = upload.array("images", 5) // field name: images, max: 5

export default upload