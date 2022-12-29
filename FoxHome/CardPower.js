// Description:
//  Creates JSON String for NSPanel CardPower
//  Author: Thorsten Böttcher (Hobbyflyer) 
//  Date : 29.12.2022
//
// Icons unter: https://htmlpreview.github.io/?https://github.com/jobr99/Generate-HASP-Fonts/blob/master/cheatsheet.html
// entityUpd~Energiefluss~1|1~65535~~288 W~64333~~0~0 W~64333~全~0~0 W~64333~全~0~0 W~34351~~1~288 W~34351~~0~288 W~34351~~0~0 W
// entityUpd~Energiefluss~1|1~26095~~284 W~64333~~0~0 W~64333~全~0~0 W~64333~全~0~0 W~34351~~1~284 W~34351~~0~283 W~34351~~0~0 W
// define "Debug=true;" for console output 
let Debug=false;
// define "Demo=true;" for Demodata
// DPJSON must be defined 
let Demo=false;

// Start configuration ****************************************************************

// define Datapoints for displayed Values 
// Aliase vom Typ INFO oder direkt auf das Objekt gehen
var ValueIconCentral     = null;
var ValueIconLeftUpper   = 'alias.0.logging.Energy.PV_BAT_DisCharge.ACTUAL';     // Lade- / Entladerate des Speichers in W  Item 1(lo) Value
var ValueIconLeftMid     = 'alias.0.logging.Energy.PWR-Solar.ACTUAL';            // Ertrag Solar 1                          Item 2(lm) Value
var ValueIconLeftLower   = 'alias.0.logging.Energy.PWR-SolarBKW.ACTUAL';         // Ertrag Solar 2                          Item 3(lu) Value
var ValueIconRightUpper  = 'alias.0.logging.Energy.PWR-Haus.ACTUAL';             // Hausverbrauch                           Item 4(ro) Value
var ValueIconRightMid    = 'alias.0.logging.Energy.PWR-Grid.ACTUAL';             // Bezug / Einspeisung Netz                Item 5(rm) Value
var ValueIconRightLower  = 'alias.0.logging.Energy.PWR-Car.ACTUAL';              // WallBox                                 Item 6(ru) Value

// define Units and Maximum Values for speed calculation
var dpValueUnit = ['W','W', 'W', 'W', 'W', 'W', 'W'];                                
var dpValuesMax = [6000,1300, 6000, 600, 4000, 6000, 11000];                          
// define direction, actually not used in cardPower !!
var valueDirection = ['both','both', 'in', 'in', 'in', 'both', 'out'];             // laut WIKI nicht genutzt 
// define Iconimages
var iconString = ['home','battery', 'solar-power-variant', 'solar-power-variant', 'home-import-outline', 'transmission-tower', 'car']; 

// define Datapoint for writing JSON String
var DPJSON         = '0_userdata.0.PVPower';

// define additional Datapoints for Batt icon change 
var ValueIconLeftUpperExt1 = 'alias.0.logging.Energy.PV_BAT_Level.ACTUAL';         // Füllstand des Speichers in %            OR "null"
var ValueIconLeftUpperExt2 = 'alias.0.logging.Energy.PV_BAT_TEMP_Combined.ACTUAL'; // Batterietemperatur                      OR "null"
var ValueIconLeftUpperExt3 = ['senec.0.BMS.SOH.0','senec.0.BMS.SOH.1'];            // Array aus Gesundheitszustand der Akkus  OR "[null]" 

// Für die dynamische Aktualisierung werden Datenpunkte auf Änderung überwacht
// Hier das Array ggf. anpassen
var watch          = [ValueIconLeftUpper, ValueIconLeftMid, ValueIconLeftLower, ValueIconRightUpper, ValueIconRightMid,ValueIconRightLower];
// Überschrift der Card zur Identifizierung der angezeigten Seite muss dem Header der cardPower entsprechen.
var CardpowerHeader ='Energiefluss';                                        
// CustomSend DataPoints for dynamic updating screen
var ActivePage = ['0_userdata.0.NSPanel.WZ.ActivePage.heading','0_userdata.0.NSPanel.WZ.ActivePage.heading'];
var CustomSend = ['mqtt.0.NSPanelOG.cmnd.CustomSend','mqtt.0.NSPanelWZ.cmnd.CustomSend'];   

//  end configuration******************************************************************

// Check Datapoints, create Error if something is wrong *************
getState(ValueIconLeftUpper,handleerror);
getState(ValueIconLeftMid,handleerror);
getState(ValueIconLeftLower,handleerror);
getState(ValueIconRightUpper,handleerror);
getState(ValueIconRightMid,handleerror);
getState(ValueIconRightLower,handleerror);
getState(DPJSON,handleerror);
       
function handleerror (err, state) {
  if (state != null) {
    console.log("sub :" + state.val);
  }
  if (err) {
    console.log(err.message);
  }
}
// End check ********************************************************

// color definition according to NSPanelts.ts "Dynamische Indikatoren"
let color0 = { red:   99, green: 190, blue: 123 };
let color1 = { red:  129, green: 199, blue: 126 };
let color2 = { red:  161, green: 208, blue: 127 };
let color3 = { red:  129, green: 217, blue: 126 };
let color4 = { red:  222, green: 226, blue: 131 };
let color5 = { red:  254, green: 235, blue: 132 };
let color6 = { red:  255, green: 210, blue: 129 };
let color7 = { red:  251, green: 185, blue: 124 };
let color8 = { red:  251, green: 158, blue: 117 };
let color9 = { red:  248, green: 131, blue: 111 };
let color10 = { red:  248, green: 105, blue: 107 };

let color =[color0,color1,color2,color3,color4,color5,color6,color7,color8,color9,color10];

// define IconSelector for CustomSend String, used for updating screen
let Icons = new IconsSelector();        

var dpValues, outJSON, outCustomSend ;

// watch Datapoins for change
if (Demo && DPJSON)
  {
    WriteDemoData();    
    setState(DPJSON, outJSON)
  } 
else
{  
on({id: watch, change: "any"}, async function (obj) {
  var iconColor=  0;
  dpValues = [ValueIconRightUpper?getState(ValueIconRightUpper).val: 0,
              ValueIconLeftUpper?getState(ValueIconLeftUpper).val: 0,  
              ValueIconLeftMid?getState(ValueIconLeftMid).val:0, 
              ValueIconLeftLower?getState(ValueIconLeftLower).val:0, 
              ValueIconRightUpper?getState(ValueIconRightUpper).val:0,
              ValueIconRightMid?getState(ValueIconRightMid).val:0,
              ValueIconRightLower?getState(ValueIconRightLower).val:0];
  // start JSON String for outJSON
  outJSON = '[';
  // start String for dynamic update 
  outCustomSend='entityUpd~'+CardpowerHeader+'~1|1';

  //for each icon collect values
  for (var i_index in dpValues) {
    var idx= parseInt(i_index);
    // calculate iconspeed
    var speed =Math.round( (10* dpValues[idx]) / dpValuesMax[idx] );  
    
    //Batt icon color depends on AccuLevel   
    if (idx == 1) 
      // check healtyness of Battery 
      if ((ValueIconLeftUpperExt2 && getState(ValueIconLeftUpperExt2).val > 35) || (ValueIconLeftUpperExt3[0] && getState(ValueIconLeftUpperExt3[0]).val < 97) || ValueIconLeftUpperExt3[1] && getState(ValueIconLeftUpperExt3[1]).val < 97 )
      {
        iconString[1]="battery-heart-variant";
        iconColor=10;
      }
      else
      {
        var level;
        ValueIconLeftUpperExt1?level = getState(ValueIconLeftUpperExt1).val: level=50;
        iconColor = 10 - Math.round(level / 10) ;
        speed = speed * -1; //invert direction
        // change icon
        iconString[1]="battery-alert-variant-outline";
        if ( level > 10)
          iconString[1]="battery-charging-outline";
        if ( level > 20)
          iconString[1]="battery-charging-20";
        if (level > 40)
          iconString[1]="battery-charging-40";
        if (level > 60)
          iconString[1]="battery-charging-60";
        if (level > 80)
          iconString[1]="battery-charging-80";
        if (level> 95)
          iconString[1]="battery";
      }
   
    
    if(idx == 2 || idx == 3)
      {
        iconColor = 10 - Math.round((10 * dpValues[idx]) / dpValuesMax[idx]) ;    
      }

    if(idx == 4)
      {
        iconColor = Math.round((10 * dpValues[idx]) / dpValuesMax[idx]) ;    
      }

    if (idx == 5)
      {  
        speed = speed * -1; //invert direction
      }
    
    // create item for DPJSON  
    var Item='{ \"id\": ' + i_index +
             ', \"value\": ' + parseInt(dpValues[idx]) +
             ', \"unit\": \"' + dpValueUnit[idx] +'\"' +
             ', \"direction\": \"' + valueDirection[idx] +'\"' +
             ', \"icon\": \"' + iconString[idx] +'\"' +
             ', \"iconColor\": ' + iconColor +
             ', \"speed\": ' + speed + '}';
    if (idx < 6)
         Item= Item + ','; 
    outJSON = String(outJSON) + Item;

    // create item for CustomSend
    var CSicon= Icons.GetIcon(iconString[i_index]) ;
    var CSiconcolor =  rgb_dec565(color[iconColor]) ;   
    if (idx==0)
       outCustomSend= outCustomSend + '~' + CSiconcolor+ '~' + CSicon +'~';// + parseInt(dpValues[i_index]) + ' ' + dpValueUnit[i_index];
    else
       outCustomSend= outCustomSend + '~' + CSiconcolor+ '~' + CSicon +'~' + speed + '~' + parseInt(dpValues[i_index]) + ' ' + dpValueUnit[i_index];
  }
  // write DPJSON
  outJSON = String(outJSON) + ']';
  if (DPJSON)
   setState(DPJSON, outJSON) ;
 
  // dynamische Aktualisierung
  // get activepage for each Panel
  for (var pindex in ActivePage){
    if(getState(ActivePage[pindex]).val==CardpowerHeader)
       setState(CustomSend[pindex],outCustomSend);
  }
      
  if (Debug) {
    console.log(outJSON);
    console.log(outCustomSend);
  }
})
};

function rgb_dec565(color) {
    //return ((Math.floor(rgb.red / 255 * 31) << 11) | (Math.floor(rgb.green / 255 * 63) << 5) | (Math.floor(rgb.blue / 255 * 31)));
    return ((color.red >> 3) << 11) | ((color.green >> 2)) << 5 | ((color.blue) >> 3)
};

function WriteDemoData(){
    outJSON="[{\"id\": 0,\"value\": 1300,\"unit\": \"\",\"direction\": \"both\",\"icon\": \"home\",\"iconColor\": 6,\"speed\": -10},";
    outJSON=outJSON+"{\"id\": 1,\"value\": 1300,\"unit\": \"W\",\"direction\": \"both\",\"icon\": \"battery-charging-40\",\"iconColor\": 6,\"speed\": -10},";
    outJSON=outJSON+"{\"id\": 2,\"value\": 2000,\"unit\": \"W\",\"direction\": \"in\",\"icon\": \"car\",\"iconColor\": 5,\"speed\": 4},";
    outJSON=outJSON+"{\"id\": 3,\"value\": 100,\"unit\": \"W\",\"direction\": \"in\",\"icon\": \"car\",\"iconColor\": 8,\"speed\": 2},";
    outJSON=outJSON+"{\"id\": 4,\"value\": 400,\"unit\": \"W\",\"direction\": \"in\",\"icon\": \"home-import-outline\",\"iconColor\": 1,\"speed\": 1},";
    outJSON=outJSON+"{\"id\": 5,\"value\": -400,\"unit\": \"W\",\"direction\": \"both\",\"icon\": \"transmission-tower\",\"iconColor\": 1,\"speed\": 1},";
    outJSON=outJSON+"{\"id\": 6,\"value\": 0,\"unit\": \"W\",\"direction\": \"both\",\"icon\": \"car\",\"iconColor\": 0,\"speed\": 0}]";
}
