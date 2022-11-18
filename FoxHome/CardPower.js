// Description:
//  Creates JSON String for NSPanel CardPower
//  Date : 18.11.2022
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

let Debug=true;

var Bat_DisCharge = 'alias.0.logging.Energy.PV_BAT_DisCharge.ACTUAL';
var Bat_AkkuLevel = 'alias.0.logging.Energy.PV_BAT_Level.ACTUAL';
var SolarEnergy   = 'alias.0.logging.Energy.SOLAR_ENERGY.ACTUAL';
var BKWEnergy     = 'alias.0.logging.Energy.BKW_energy.ACTUAL';
var HouseEnergy   = 'alias.0.logging.Energy.House_Energy.ACTUAL';
var GridEnergy    = 'alias.0.logging.Energy.GRID_ENERGY.ACTUAL';
var CarEnergy     = 'alias.0.logging.Energy.Car_Energy.ACTUAL';

var watch = [Bat_DisCharge, SolarEnergy, BKWEnergy, HouseEnergy, GridEnergy]

var dpValues, outJSON ;
var dpValueUnit = ['W', 'W', 'W', 'W', 'W', 'W'];
var dpValuesMax = [1300, 6000, 600, 8000, 8000, 11000];
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
  for (var i_index in dpValues) {
    var speed = parseInt(Math.round((10* dpValues[i_index]) / dpValuesMax[i_index])) ;  
    
    //Bat icon color depends on AccuLevel   
    if (i_index == 0)
      {
        iconColor = 10 - Math.round(getState(Bat_AkkuLevel).val / 10) ;
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
  }
  outJSON = String(outJSON) + ']';
  setState("0_userdata.0.PVPower", outJSON);

  if (Debug) {
    console.log(outJSON);
  }
});