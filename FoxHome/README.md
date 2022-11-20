# NSPanel

## TASMOTA
### Weblinks
[Blakadder NSpanel (1)](https://templates.blakadder.com/sonoff_NSPanel.html)<br>
[Tasmota online flasher (2)](https://tasmota.github.io/install)<br>
[ns-flash](https://github.com/peepshow-21/ns-flash)<br>
[nspanel-lovelace](https://github.com/joBr99/nspanel-lovelace-ui/tree/main/tasmota)<br>
[Dokumentation](https://docs.nspanel.pky.eu/)<br>

[iobroker / nspanel](https://forum.iobroker.net/topic/58170/sonoff-nspanel-mit-lovelace-ui)<br>
[Youtube](https://www.youtube.com/watch?v=ZPLJk2ZLo_8)


## Step 1: Flash & Config NSPanel (1)


### Flash Tasmota32-nspanel (2)
http://ota.tasmota.com/tasmota32/release/tasmota32-nspanel.bin
https://tasmota.github.io/install/

NSPanel.tft in this Folder is for NX4832K035_011 

### Tasmota Config
```code
{"NAME":"NSPanel","GPIO":[0,0,0,0,3872,0,0,0,0,0,32,0,0,0,0,225,0,480,224,1,0,0,0,33,0,0,0,0,0,0,0,0,0,0,4736,0],"FLAG":0,"BASE":1,"CMND":"ADCParam 2,11200,10000,3950 | Sleep 0 | BuzzerPWM 1"}`
```

## Show ESP Temperature
```
SetOption146 1
```

## Step 2: Detach Buttons from Relais
```code
SetOption73 1
```

## CardPower Script

Colors:<br>
Colors from NSPalnelts.ts <bold>Dynamische Indikatoren</bold><br>

<span style="color: rgb(99, 190, 123)">colorindex=0</span><br>
<span style="color: rgb(129, 199, 126)">colorindex=1</span><br>
<span style="color: rgb(161, 208, 127)">colorindex=2</span><br>
<span style="color: rgb(129, 217, 126)">colorindex=3</span><br>
<span style="color: rgb(222, 226, 131)">colorindex=4</span><br>
<span style="color: rgb(254, 235, 132)">colorindex=5</span><br>
<span style="color: rgb(255, 210, 129)">colorindex=6</span><br>
<span style="color: rgb(251, 185, 124)">colorindex=7</span><br>
<span style="color: rgb(251, 158, 117)">colorindex=8</span><br>
<span style="color: rgb(248, 131, 111)">colorindex=9</span><br>
<span style="color: rgb(248, 105, 107)">colorindex=10</span><br>


