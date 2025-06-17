let regService=require("../services/RegisterService.js");
const bcrypt = require("bcryptjs");
let jwt=require("jsonwebtoken");
let cookie=require("cookie-parser");
let db=require("../config/db.js");

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

exports.SaveHotel=(req,res)=>
{
 let {hotel_name,hotel_address,city_id,area_id,hotel_email, hotel_contact,rating,pic_id}=req.body;

console.log(pic_id+ "  pic id is ")
db.query("insert into hotelmaster  values('0',?,?,?,?,?,?,?,?)", [hotel_name,hotel_address,city_id,area_id,hotel_email, hotel_contact,rating,pic_id],(err,result)=>
{
	db.query("SELECT * FROM citymaster",(err,citresult)=>{

	db.query("SELECT * FROM areamaster",(err,arearesult)=>{

	db.query("SELECT * FROM hotelpicjoin",(err,picresult)=>{
     res.render("hotel.ejs",{Citdata:citresult,Areadata:arearesult,Picdata:picresult,msg:"Hotel added successfully "});
})
})
})
});
};


exports.hotelviewCtrl=(req,res)=>{
   let query = `SELECT h.hotel_id, p.filename, h.hotel_name, h.hotel_address, c.city_name, a.area_name, h.hotel_email, h.hotel_contact, h.rating FROM hotelmaster h LEFT JOIN hotelpicjoin p ON h.pic_id = p.pic_id JOIN citymaster c ON h.city_id = c.city_id JOIN areamaster a ON h.area_id = a.area_id`;
db.query(query, (err, result) => {
    if (err) {
      
      return res.render("hotelview.ejs",{ data: [] }); 
    } 
    else {
      res.render("hotelview.ejs",{ data: result });
    }
});
};

//Hotel Image Controller

exports.hotelImageDashCtrl=(req,res)=>{
   res.render("HotelImageDash.ejs"); 
}

exports.HotelImageformCtrl=(req,res)=>{
  res.render("addHotelImage.ejs");
}







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


// User Dashboard Router
exports.userPanel=(req,res)=>{
  res.render("userDashboard");
}
  
