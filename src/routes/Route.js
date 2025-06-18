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

router.get("/hotelviewdata", controller.viewHotelCtrl);

router.get("/hotelviewdata/:id", controller.viewHotelwithImage);

//hotel update data

router.get("/updateHotel",controller.HotelUpadate);
router.post("/finalupdateHotel",controller.FinlHotelUpadate);

// router.get("/viewHotelAdmin", controller.ViewHotelAdmin);

router.get("/updatehotel",controller.HotelView);

// hotel delete data
router.get("/deleteHotelAdminById",controller.HotelAdminDelete);






router.get("/hotelImgDash",controller.hotelImageDashCtrl);

router.get("/hotelImgform",controller.HotelImageformCtrl);

router.post("/hotelImageadd",controller.hotelImageaddCtrl);

router.get("/image",controller.ViewImgCtrl);



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



router.get("/viewcustomer",controller.CustomerView);





// User DashBorad Controller
router.get("/userDashboard",controller.userPanel);


router.get("/userhotel",controller.userhotelDashCtrl);


router.get("/addreview",controller.reviewRatingCtrl);
router.get("/review",controller.Reviewpage);
router.post("/savereview",controller.SaveReview)









module.exports=router;