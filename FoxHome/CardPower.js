// Description:
//  Creates JSON String for NSPanel CardPower
//  Date : 20.11.2022
//
//  { 
//  "id": 1,                          top left 0 (down) top right 3 (down)                 
//  "value": 3,                       value (float) 
//  "unit": "W",                      unit
//  "direction": "in",                in, out, both
//  "icon": "battery-charging-60",    icon 
//  "iconColor": 10,                  0= green 5=yellow 10=red
//  "speed": -3                       animation speed & direction
//  }
//

// define debug= true for console output 
let Debug=false;

// define Datapoints
var Batt_DisCharge = 'alias.0.logging.Energy.PV_BAT_DisCharge.ACTUAL';
var Batt_AkkuLevel = 'alias.0.logging.Energy.PV_BAT_Level.ACTUAL';
var Batt_Temp      = 'senec.0.TEMPMEASURE.BATTERY_TEMP';
var Batt_Health    =  ['senec.0.BMS.SOH.0','senec.0.BMS.SOH.1'];
var SolarEnergy    = 'alias.0.logging.Energy.SOLAR_ENERGY.ACTUAL';
var BKWEnergy      = 'alias.0.logging.Energy.BKW_energy.ACTUAL';
var HouseEnergy    = 'alias.0.logging.Energy.House_Energy.ACTUAL';
var GridEnergy     = 'alias.0.logging.Energy.GRID_ENERGY.ACTUAL';
var CarEnergy      = 'alias.0.logging.Energy.Car_Energy.ACTUAL';
var DPJSON         = '0_userdata.0.PVPower';
var watch          = [Batt_DisCharge, SolarEnergy, BKWEnergy, HouseEnergy, GridEnergy];

var dpValueUnit = ['W', 'W', 'W', 'W', 'W', 'W'];
var dpValuesMax = [1300, 6000, 600, 4000, 6000, 11000];
var valueDirection = ['both', 'in', 'in', 'in', 'both', 'out'];
var iconString = ['battery', 'solar-power-variant', 'solar-power-variant', 'home-import-outline', 'transmission-tower', 'car'];
var CardpowerHeader ='Energiefluss';
// CustomSend DataPoints for dynamic updating screen
var CustomSend = ['mqtt.0.NSPanel.cmnd.CustomSend','mqtt.0.NSPanelOG.cmnd.CustomSend','mqtt.0.NSPanelWZ.cmnd.CustomSend'];
var DPActivePage = ['0_userdata.0.NSPanel.1.ActivePage','0_userdata.0.NSPanel.2.ActivePage','0_userdata.0.NSPanel.9.ActivePage'];
       

// ******************************************************************+

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
on({id: watch, change: "any"}, async function (obj) {
  var iconColor=  0;
  dpValues = [getState(Batt_DisCharge).val, 
              getState(SolarEnergy).val, 
              getState(BKWEnergy).val, 
              getState(HouseEnergy).val,
              getState(GridEnergy).val,
              0];
  // start JSON String for outJSON
  outJSON = '[';
  // start String for dynamic update 
  outCustomSend='entityUpd~'+CardpowerHeader+'~1|1~65535~~';

  //for each icon collect values
  for (var i_index in dpValues) {
    // calculate iconspeed
    var speed =parseInt(Math.round( (10* dpValues[i_index]) / dpValuesMax[i_index] ));  
    
    //Batt icon color depends on AccuLevel   
    if (i_index == 0) 
      // check healtyness of Battery 
      if (getState(Batt_Temp).val > 35 || getState(Batt_Health[0]).val < 97 || getState(Batt_Health[1]).val <97 )
      {
        iconString[0]="battery-heart-variant";
        iconColor=10;
      }
      else
      {
        var level = getState(Batt_AkkuLevel).val; 
        iconColor = 10 - Math.round(level / 10) ;
        speed = speed * -1; //invert direction
        // change icon
        iconString[0]="battery-alert-variant-outline";
        if ( level > 10)
          iconString[0]="battery-charging-outline";
        if ( level > 20)
          iconString[0]="battery-charging-20";
        if (level > 40)
          iconString[0]="battery-charging-40";
        if (level > 60)
          iconString[0]="battery-charging-60";
        if (level > 80)
          iconString[0]="battery-charging-80";
        if (level> 95)
          iconString[0]="battery";
      }
   
    if(i_index == 1 || i_index == 2)
      {
        iconColor = parseInt(10 - Math.round((10 * dpValues[i_index]) / dpValuesMax[i_index])) ;    
      }

    if(i_index == 3)
      {
        iconColor = parseInt(Math.round((10 * dpValues[i_index]) / dpValuesMax[i_index])) ;    
      }

    if (i_index == 4)
      {  
        speed = speed * -1; //invert direction
      }
    
    // create item for DPJSON  
    var Item='{ \"id\": ' + i_index +
             ', \"value\": ' + parseInt(dpValues[i_index]) +
             ', \"unit\": \"' + dpValueUnit[i_index] +'\"' +
             ', \"direction\": \"' + valueDirection[i_index] +'\"' +
             ', \"icon\": \"' + iconString[i_index] +'\"' +
             ', \"iconColor\": ' + iconColor +
             ', \"speed\": ' + speed + '}';
    if (i_index < 5)
         Item= Item + ','; 
    outJSON = String(outJSON) + Item;

    // create item for CustomSend
    var CSicon= Icons.GetIcon(iconString[i_index]) ;
    var CSiconcolor =  rgb_dec565(color[iconColor]) ;   
    outCustomSend= outCustomSend + '~' + CSiconcolor+ '~' + CSicon +'~' + speed + '~' + parseInt(dpValues[i_index]) + ' ' + dpValueUnit[i_index];
  }
  // write DPJSON
  outJSON = String(outJSON) + ']';
  setState(DPJSON, outJSON);
 
  // get activepage for each Panel
  CustomSend.forEach(function (item) {
    var activepage= JSON.stringify(getState(item));
    // if activepage == Energie ... // hack cause ther is not Dp with activepage
    if (activepage.includes(CardpowerHeader))
      setState(item,outCustomSend);
  })
  
      
  if (Debug) {
    console.log(outJSON);
  }
});

function rgb_dec565(color) {
    //return ((Math.floor(rgb.red / 255 * 31) << 11) | (Math.floor(rgb.green / 255 * 63) << 5) | (Math.floor(rgb.blue / 255 * 31)));
    return ((color.red >> 3) << 11) | ((color.green >> 2)) << 5 | ((color.blue) >> 3)
}