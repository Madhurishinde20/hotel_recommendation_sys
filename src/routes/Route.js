let express = require("express");
let router=express.Router();
let multer = require("multer");
let path = require("path");
let controller=require("../controller/regctrl.js");


router.get("/",(req,res)=>{
    res.render("home");
})

router.get("/reg",controller.regCtrl);
router.post("/savereg",controller.saveReg);
router.get("/login",controller.regLogin);
router.get("/signin", controller.regLogin);
router.get("/signup", controller.regCtrl);


router.post("/validate",controller.validateUser);

//Admin Dashboard Controller
router.get("/admin", controller.adminDashboard);


router.get("/hotelDash",controller.hotelDashCtrl);

router.post("/addhotel", controller.saveHotel);

router.get("/hotelform",controller.hotelviewCtrl);


router.get("/hotelImgDash",controller.hotelImageDashCtrl);

router.get("/hotelImgform",controller.HotelImageformCtrl);

router.post("/hotelImageadd",controller.hotelImageaddCtrl);




router.get("/cityDash",controller.CityDashCtrl);
 
router.get("/cityform",controller.cityformCtrl);

router.post("/cityadd",controller.cityadd);

router.get("/viewcity",controller.viewCityCtrl);

router.get("/deleteCity",controller.CityDeleteCtrl);


router.get("/areaDash",controller.areaDashCtrl);
 
router.get("/areaform",controller.areaformCtrl);

router.post("/areaadd",controller.areaadd);

router.get("/viewarea",controller.viewAreaCtrl);

router.get("/deletearea",controller.areaDeleteCtrl);



router.get("/viewcustomer",controller.ViewHotelDash);





// User DashBorad Controller
router.get("/userDashboard",controller.userPanel);

module.exports=router;