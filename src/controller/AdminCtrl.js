let regService=require("../services/RegisterService.js");
const bcrypt = require("bcryptjs");
let jwt=require("jsonwebtoken");
let cookie=require("cookie-parser");
let db=require("../config/db.js");
let model=require("../models/regmodel.js");
//
exports.homeCtrl=(req,res)=>{
    res.render("home.ejs");
}

exports.regCtrl=(req,res)=>{
    res.render("register.ejs",{msg:null});
}


exports.saveReg = async (req, res) => {
  try {
    let { username, useremail, password, contact, type } = req.body;
    contact = Number(contact); 

    const result = await regService.regserviceLogic(username, useremail, password, contact, type);
    res.send("success");
  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).send({ message: err.message || "Internal server error" });
  }
};

exports.regLogin=((req,res)=>{
    res.render("login.ejs",{msg:null});
});

exports.validateUser = async (req, res) => {
  try {
    const { username, password,type } = req.body;

    if (!username || !password  || !type)
     {
      return res.status(400).send("");
    }
    const user = await regService.getOriginalPassword(username);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (isMatch){
      const token = jwt.sign({
         id: user.userid, 
         name: username 
        },"11$$$66&&&&4444", { expiresIn: "1h" }
      );
      console.log("Generated Token:", token);

      /*return res.send({ message: "Login successful", token });
    }*/
    if (type === "Admin") 
      {
           res.redirect("admin");

      }
       else if (type === "User")
         {
            res.render("userDashboard.ejs");
       } 
       else 
        {
             return res.render("login", { msg: "Invalid role selected" });
        }
      }

    else 
    {
      return res.send("Incorrect password");
    }
  } catch (err) {
    console.error("Error in validateUser:", err);
    res.status(500).send("Internal server error");
  }
};

//Admin Dashboard routers

exports.adminDashboard = (req, res) => {
  let section = req.query.section || "";
  res.render("admin",{section});
};

// hotel all Controller

exports.hotelDashCtrl=(req,res)=>{
  res.render("hotelDashboard.ejs");
}

exports.hotelformCtrl=(req,res)=>{

  res.render("hotel.ejs");
}

// hotel add 
exports.saveHotel = (req, res) => {
  let {
    
    hotel_name,
    hotel_address,
    city_id,
    area_id,
    hotel_email,
    hotel_contact,
    rating,
    reviewcount
  } = req.body;

  console.log(req.body);

  // Convert data types
 
  city_id = parseInt(city_id);
  area_id = parseInt(area_id);
  hotel_contact = parseInt(hotel_contact);
  rating = parseFloat(rating);
  reviewcount = parseInt(reviewcount);

  let query = `INSERT INTO hotelmaster (hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating, reviewcount)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  let values = [hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating, reviewcount];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting hotel:", err);
      return res.send("Error saving hotel data");
    } else {
       console.log("successfully added"); 
       return res.redirect("/hotelform?msg=Hotel added successfully!"); 
    }
  });
};


exports.hotelviewCtrl = (req, res) => {
 
  db.query("SELECT * FROM citymaster", (err, citResult) => {
    if (err) {
      return res.send("Error loading cities");
    }

    db.query("SELECT * FROM areamaster", (err, areaResult) => {
      if (err) {
        return res.send("Error loading areas");
      }
      console.log(areaResult);
      res.render("hotel.ejs", {
        data: citResult,
        Areadata: areaResult,
        
      });
    });
  });
};

exports.viewHotelCtrl = (req, res) => {
  let hotelQuery = `
    SELECT h.*, c.city_name, a.area_name, hp.filename
    FROM hotelpicjoin hp 
    INNER JOIN hotelmaster h ON h.hotel_id = hp.hotel_id
    JOIN citymaster c ON h.city_id = c.city_id
    JOIN areamaster a ON h.area_id = a.area_id 
   
  `;
  db.query(hotelQuery,  (err, hotelResults) => {
    if (err || hotelResults.length === 0) {
      return res.send("Error loading hotel or hotel not found.");
      console.error(err);
    }
    res.render("viewHotelAdmin.ejs", { HotelAdmindata:hotelResults });
  });
};

exports.viewHotelwithImage=(req,res)=>{
  let hotelId = req.params.id;
let hotelQuery = `
    SELECT h.*, c.city_name, a.area_name, hp.filename
    FROM hotelpicjoin hp 
    INNER JOIN hotelmaster h ON h.hotel_id = hp.hotel_id
    JOIN citymaster c ON h.city_id = c.city_id
    JOIN areamaster a ON h.area_id = a.area_id 
     where h.hotel_id=?
  `;
  db.query(hotelQuery,[hotelId],(err, hotelResults) => {
    if (err || hotelResults.length === 0) {
      return res.send("Error loading hotel or hotel not found.");
    }
    res.render("hotelview.ejs",{ hotel: hotelResults } );
  });
};
  
  exports.HotelUpadate = (req, res) => {
  let hotelid = parseInt(req.query.hotelid.trim());
  console.log("Hotel ID to update:", hotelid);

  const query = "SELECT h.hotel_id, p.filename, h.hotel_name, h.hotel_address, c.city_id, c.city_name, a.area_id, a.area_name, h.hotel_email, h.hotel_contact, h.rating FROM hotelmaster h LEFT JOIN hotelpicjoin p ON h.hotel_id = p.hotel_id JOIN citymaster c ON h.city_id = c.city_id JOIN areamaster a ON h.area_id = a.area_id WHERE h.hotel_id = ?";

  db.query(query, [hotelid], (err, result) => {
    if (err) return res.send("Error loading hotel data");
    if (result.length === 0) return res.send("No hotel found");

    db.query("SELECT * FROM citymaster", (err, citresult) => {
      db.query("SELECT * FROM areamaster", (err, arearesult) => {
        db.query("SELECT * FROM hotelpicjoin", (err, picresult) => {
          res.render("updateHotelById.ejs", {
            erecord: result[0],
            Citdata: citresult,
            Areadata: arearesult,
            Picdata: picresult
          });
        });
      });
    });
  });
};

  exports.FinlHotelUpadate = (req, res) => {
  let {
    hotel_id,
    hotel_name,
    hotel_address,
    city_id,
    area_id,
    hotel_email,
    hotel_contact,
    rating
  } = req.body;
   console.log("Update Request Body:", req.body);
  const updateQuery = "UPDATE hotelmaster SET hotel_name=?, hotel_address=?, city_id=?, area_id=?, hotel_email=?, hotel_contact=?, rating=? WHERE hotel_id=?";

  db.query(updateQuery, [hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating, hotel_id], (err, result) => {
    if (err) {
      console.log("Update error:", err);
      return res.send("Error updating hotel.");
    }
    res.redirect("/hotelviewdata");
  });
};

exports.HotelView = (req, res) => {
  db.query("SELECT * FROM hotelmaster", (err, result) => {
    if (err) return res.send("Error loading hotel list");
    res.render("viewHotelAdmin.ejs", { hoteldata: result });
  });
};

// hotel Delete
exports.HotelAdminDelete = (req, res) => {
  let hotel_id = parseInt(req.query.hoteladminid.trim());

  // First delete from hotelpicjoin (child table)
  db.query("DELETE FROM hotelpicjoin WHERE hotel_id = ?", [hotel_id], (err1, result1) => {
    if (err1) {
      console.log("Error deleting hotel image:", err1);
      return res.send("Cannot delete hotel image. Check console.");
    }

    // Then delete from hotelmaster (parent table)
    db.query("DELETE FROM hotelmaster WHERE hotel_id = ?", [hotel_id], (err2, result2) => {
      if (err2) {
        console.log("Error deleting hotel:", err2);
        return res.send("Cannot delete hotel. Check console.");
      }

      // After delete, load and show hotel list
      db.query(`SELECT h.hotel_id, h.hotel_name, h.hotel_address, c.city_name, a.area_name,
                       h.hotel_email, h.hotel_contact, h.rating, hp.filename
                FROM hotelmaster h
                LEFT JOIN citymaster c ON h.city_id = c.city_id
                LEFT JOIN areamaster a ON h.area_id = a.area_id
                LEFT JOIN hotelpicjoin hp ON h.hotel_id = hp.hotel_id`, 
                (err3, result3) => {
        if (err3) {
          console.log("Error loading hotel list:", err3);
          return res.send("Error loading updated hotel list.");
        }
        res.render("viewHotelAdmin.ejs", { HotelAdmindata: result3 });
      });
    });
  });
};

//Hotel Image Controller

exports.hotelImageDashCtrl=(req,res)=>{
   res.render("HotelImageDash.ejs"); 
};

exports.HotelImageformCtrl=async(req,res)=>{
  try
  {
    let hd=await model.getdata();
  res.render("addHotelImage.ejs",{ msg: "Hotel image uploaded successfully!" ,hoteldata:hd});
  }
  catch(err)
  {
    console.log(err);
     res.render("addHotelImage.ejs",{ msg: "Hotel image uploaded successfully!",hoteldata:[] });
  }
};

exports.hotelImageaddCtrl = async(req, res) => {
   let {hotelname,filename}=req.body;
   console.log(req.body);
   try
   {
    let hd=await model.getdata();
  db.query("INSERT INTO hotelpicjoin VALUES (?, ?)", [hotelname,filename], (err, result) => {
    if (err) {
      console.log(err);
      res.render("addHotelImage.ejs", { msg: "Some Problem Occurred while Adding Pic" ,hoteldata:hd});
    } else {
      res.render("addHotelImage.ejs", { msg: "Pic added successfully" ,hoteldata:hd});
    }
  });
}
catch(err)
{
  res.render("addHotelImage.ejs",{ msg: "Hotel image uploaded successfully!",hoteldata:[] });
}
};

exports.ViewImgCtrl = (req, res) => {
  db.query("SELECT * FROM hotelpicjoin", (err, result) => {
    if (err) {
      console.error("Error fetching images:", err);
      return res.send("Error loading images");
    }
    res.render("viewHotelImage.ejs", {
      HotelPicdata: result 
    });
  });
};

 
// City All Controller

  exports.CityDashCtrl=(req,res)=>{
	res.render("cityDashboard.ejs");
};

exports.cityformCtrl=(req,res)=>{
  res.render("city.ejs");
}

exports.cityadd=(req,res)=>
{
  let{city_name,pincode}=req.body;

  db.query("select city_id from citymaster order by city_id desc limit 1",(err,result)=>
  {
      if(err)
      {
        console.log(err);
      }
      else
      {
        if(result.length==0)
        {
          var ccid=0+1;
          console.log(ccid);
           db.query("insert into citymaster values(?,?,?)",[ccid,city_name,pincode],(err,result)=>
          {
           if(err)
          {
        console.log(err); 
          }
      else
      {
        console.log("sucessfull");
      }
  ``});
        }
        else
        {
           var ccid=result[0].city_id+1;
           console.log(ccid);
           db.query("insert into citymaster values(?,?,?)",[ccid,city_name,pincode],(err,result)=>
        {
      if(err)
      {
        console.log(err);
      }
      else
      {
         res.redirect("/cityform");
         console.log("sucessful");
      }
  });
        }
      }
  });
};

exports.viewCityCtrl=(req,res)=>{
  db.query("select * from citymaster",(err,result)=>{
    if(err)
    {
      res,render("viewCity.ejs");
    }
    else{
      res.render("viewCity.ejs",{Citydata:result});
    }
  });
}

exports.CityDeleteCtrl=(req, res) => {
  let city_id = parseInt(req.query.cityid.trim());
  db.query("delete from citymaster where city_id=?", [city_id], (err, result) => { 
  });
  db.query("select * from citymaster", (err, result) => {
    if (err) {
      console.log("Some Problem Occured " + err);
    } else {
      res.render("viewCity.ejs", { Citydata: result });
    }
  });
};



//Area Controller

 exports.areaDashCtrl=(req,res)=>{
	res.render("areaDashboard.ejs");
};

exports.areaformCtrl=(req,res)=>{
  res.render("area.ejs");
}

exports.areaadd=(req,res)=>{
    let{area_name}=req.body;
    db.query("insert into areamaster (area_name) values(?)",[area_name],(err,result)=>{
      if(err)
      {
        console.log(err);
        res.render("area.ejs", { msg: "Error adding area" });
      }
      else{
        console.log("successful"); 
        res.render("area.ejs", { msg: "Area added successfully!" }); 
      }
    });  
}

exports.viewAreaCtrl=(req,res)=>{
  db.query("select * from areamaster",(err,result)=>{
     if(err)
     {
       res.render("viewArea.ejs");
     }
     else{
       res.render("viewArea.ejs",{Areadata:result});
     }
  });
}

exports.areaDeleteCtrl=(req, res) => {
  let  area_id = parseInt(req.query.areaid.trim());
  db.query("delete from areamaster where area_id=?", [ area_id], (err, result) => {
});
  db.query("select * from areamaster", (err, result) => {
    if (err) {
      console.log("Some Problem Occured " + err);
    } else {
      res.render("viewArea.ejs", { Areadata: result });
    }
  });
};

//Amenities

exports.AmenitiesDash=(req,res)=>{

	res.render("amenitiesDash.ejs");

};

exports.Amenitiespage=(req,res)=>{

	res.render("amenities.ejs",{msg:""});

};

exports.Saveamenities=(req,res)=>
{
 let {amenity_name}=req.body;
db.query("insert into amenities  values('0',?)", [amenity_name],(err,result)=>
{
	if(err){
		res.render("amenities.ejs",{msg:"Some Problem Occured while Adding course"});
	}else{
		res.render("amenities.ejs",{msg:"Amenities added successfully"});
	}
});
};

exports.ViewAmenitiespage=(req, res) => {
	db.query("select * from amenities",(err,result)=>
{
	if(err)
	{
		res.render("viewAmenities.ejs");

	}
	else
	{
		res.render("viewAmenities.ejs",{Amenitiesdata:result});

	}
});
}


exports.AmenitiesDelete=(req, res) => {
  let  amenity_id  = parseInt(req.query.amenityid.trim());
  db.query("delete from amenities where  amenity_id =?", [ amenity_id ], (err, result) => {

	if(err)
	{
		console.log(err)
	}
});
  db.query("select * from amenities", (err, result) => {
    if (err) {
      console.log("Some Problem Occured " + err);
    } else {
      res.render("viewAmenities.ejs", { Amenitiesdata: result });
    }
  });
};

exports.AmenitiesUpdateForm = (req, res) => {
  let amenity_id = parseInt(req.query.amenityid.trim());
  db.query("SELECT * FROM amenities WHERE amenity_id = ?", [amenity_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Error fetching amenity.");
    }
    if (result.length > 0) {
      res.render("updateAmenities.ejs", { singleAmenity: result[0],msg: "" });
    } else {
      res.send("Amenity not found");
    }
  });
};

exports.AmenitiesUpdateSave = (req, res) => {
  const { amenity_id, amenity_name } = req.body;
  db.query("UPDATE amenities SET amenity_name = ? WHERE amenity_id = ?", [amenity_name, amenity_id], (err, result) => {
    if (err) {
      console.log("Update error: ", err);
      return res.send("Error updating amenity.");
    }
    db.query("SELECT * FROM amenities", (err, result) => {
      if (err) {
        console.log("Some Problem Occured " + err);
      } else {
        res.render("viewAmenities.ejs", { Amenitiesdata: result });
      }
    });
  });
};


// Customer 
  exports.CustomerView=(req, res) => {
	db.query("select * from usermaster where type=?",["user"],(err,result)=>
{
	if(err)
	{
		res.render("customer.ejs",{Userdata:[]});

	}
	else
	{
		res.render("customer.ejs",{Userdata:result});

	}
});
}

//Logout 

exports.logoutUser = (req, res) => {
  try {
    res.clearCookie('token');
    // redirect entire window outside iframe
    res.send('<script>window.top.location.href="/login"</script>');
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).send("Logout failed");
  }
};

exports.HomePage = (req, res) => {
  res.render("Home");
};

//USER CTRL
exports.userPanel=(req,res)=>{
  res.render("userDashboard");
}
  
exports.userhotelDashCtrl=(req,res)=>{
  const Citdata = [
    { city_id: 1, city_name: "Mumbai" },
    { city_id: 2, city_name: "Pune" },
    { city_id: 3, city_name: "Nashik" }
  ];
  const filename = "no"; 
  res.render("userhotelDash.ejs",{ Citdata, filename });
};


// Rating and Review

exports.reviewRatingCtrl=(req,res)=>{
  res.render("UserAddreview.ejs",{ msg: "" });
};

exports.Reviewpage=(req,res)=>{
	res.render("UserAddreview.ejs",{msg:""});
};

exports.SaveReview=(req,res)=>
{
 let {rev_text,rating,rev_date}=req.body;


db.query("insert into reviewmaster  values('0',?,?,?)", [rev_text,rating,rev_date],(err,result)=>
{
	if(err){
		res.render("UserAddreview.ejs",{msg:"Some Problem Occured while Adding Review"});
	}else{
		res.render("UserAddreview.ejs",{msg:"Review added successfully"});
	}
});

};