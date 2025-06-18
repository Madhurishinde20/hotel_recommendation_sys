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
    hotel_id,
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
  hotel_id = parseInt(hotel_id);
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

      res.render("hotel.ejs", {
        data: citResult,
        Areadata: areaResult,
      });
    });
  });
};


exports.viewHotelCtrl = (req, res) => {
  const hotelQuery = `
     SELECT h.*, c.city_name, a.area_name,hp.filename
       FROM hotelpicjoin hp inner join hotelmaster h on h.hotel_id=hp.hotel_id
       JOIN citymaster c ON h.city_id = c.city_id
       JOIN areamaster a ON h.area_id = a.area_id 
  `;

  db.query(hotelQuery, (err, hotelResults) => {
    if (err) {
      return res.send("Error loading hotels");
    }

    res.render("viewHotelAdmin.ejs", {
      data: hotelResults
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

// Customer 
  exports.ViewHotelDash=(req,res)=>{

  db.query("SELECT * FROM citymaster",(err,citresult)=>{

	db.query("SELECT * FROM areamaster",(err,arearesult)=>{

	res.render("customer.ejs",{Citdata:citresult,Areadata:arearesult});

	});
});
};




// User Dashboard Router
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

