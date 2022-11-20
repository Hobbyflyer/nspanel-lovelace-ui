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

/*//Dynamische Indikatoren
const colorScale0:      RGB = { red:   99, green: 190, blue: 123 };
const colorScale1:      RGB = { red:  129, green: 199, blue: 126 };
const colorScale2:      RGB = { red:  161, green: 208, blue: 127 };
const colorScale3:      RGB = { red:  129, green: 217, blue: 126 };
const colorScale4:      RGB = { red:  222, green: 226, blue: 131 };
const colorScale5:      RGB = { red:  254, green: 235, blue: 132 };
const colorScale6:      RGB = { red:  255, green: 210, blue: 129 };
const colorScale7:      RGB = { red:  251, green: 185, blue: 124 };
const colorScale8:      RGB = { red:  251, green: 158, blue: 117 };
const colorScale9:      RGB = { red:  248, green: 131, blue: 111 };
const colorScale10:     RGB = { red:  248, green: 105, blue: 107 };
*/

// define debug 
let Debug=false;
// define IconSelector for CustomSend String (update screen)
let Icons = new IconsSelector();        

// define Datapoints
var Bat_DisCharge = 'alias.0.logging.Energy.PV_BAT_DisCharge.ACTUAL';
var Bat_AkkuLevel = 'alias.0.logging.Energy.PV_BAT_Level.ACTUAL';
var SolarEnergy   = 'alias.0.logging.Energy.SOLAR_ENERGY.ACTUAL';
var BKWEnergy     = 'alias.0.logging.Energy.BKW_energy.ACTUAL';
var HouseEnergy   = 'alias.0.logging.Energy.House_Energy.ACTUAL';
var GridEnergy    = 'alias.0.logging.Energy.GRID_ENERGY.ACTUAL';
var CarEnergy     = 'alias.0.logging.Energy.Car_Energy.ACTUAL';
var DPJSON        = '0_userdata.0.PVPower';
var watch = [Bat_DisCharge, SolarEnergy, BKWEnergy, HouseEnergy, GridEnergy];

var CustomSend = ['mqtt.0.NSPanelOG.cmnd.CustomSend','mqtt.0.NSPanelWZ.cmnd.CustomSend'];

var dpValues, outJSON, outCustomSend ;
var dpValueUnit = ['W', 'W', 'W', 'W', 'W', 'W'];
var dpValuesMax = [1300, 6000, 600, 4000, 6000, 11000];
var valueDirection = ['both', 'in', 'in', 'in', 'both', 'out'];
var iconString = ['battery-charging-60', 'solar-power-variant', 'solar-power-variant', 'home-import-outline', 'transmission-tower', 'car'];

on({id: watch, change: "any"}, async function (obj) {
  var iconColor=  0;
  dpValues = [getState(Bat_DisCharge).val, 
              getState(SolarEnergy).val, 
              getState(BKWEnergy).val, 
              getState(HouseEnergy).val,
              getState(GridEnergy).val,
              0];

  outJSON = '[';
  outCustomSend='entityUpd~Energiefluss~1|1~65535~~';

  for (var i_index in dpValues) {
    var speed =parseInt(Math.round( (10* dpValues[i_index]) / dpValuesMax[i_index] ));  
    
    //Bat icon color depends on AccuLevel   
    if (i_index == 0)
      {
        iconColor = 10 - Math.round(getState(Bat_AkkuLevel).val / 10) ;
        speed = speed * -1;
        var level = getState(Bat_AkkuLevel).val; 
        
        iconString[0]="battery-alert-variant-outline";
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

    // Grid reverse animation
    if (i_index == 4)
      {  
        speed = speed * -1;
      }
      
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

    var CSicon= Icons.GetIcon(iconString[i_index])
    var CSiconcolor =  rgb_dec565(255,255,255) ;   
    console.log(CSiconcolor); 
    outCustomSend= outCustomSend + '~' + CSiconcolor+ '~' + CSicon +'~' + speed + '~' + parseInt(dpValues[i_index]) + ' ' + dpValueUnit[i_index];
  }

  outJSON = String(outJSON) + ']';
  setState(DPJSON, outJSON);
 
  // get activepage 
  CustomSend.forEach(function (item) {
    var activepage= JSON.stringify(getState(item));
    // if activepage == Energie ... // hack cause ther is not Dp with activepage
    if (activepage.includes("Energie"))
    {
      //console.log(outCustomSend);
      setState(item,outCustomSend);
    }
  })
      
  if (Debug) {
    console.log(outJSON);
  }
});

function rgb_dec565(r,g,b) {
    //return ((Math.floor(rgb.red / 255 * 31) << 11) | (Math.floor(rgb.green / 255 * 63) << 5) | (Math.floor(rgb.blue / 255 * 31)));
    return ((r >> 3) << 11) | ((g >> 2)) << 5 | ((b) >> 3)
}



