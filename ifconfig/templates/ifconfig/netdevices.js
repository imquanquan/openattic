{% load i18n %}

Ext.namespace("Ext.oa");


Ext.oa.Ifconfig__NetDevice_Panel = Ext.extend(Ext.canvasXpress, {
  initComponent: function(){
    var nfsGrid = this;
    Ext.apply(this, Ext.apply(this.initialConfig, {
      id: 'ifconfig__netdevice_panel_inst',
      title: "{% trans 'Network interfaces' %}",
      store: new Ext.data.DirectStore({
        fields: ["devname", "devtype", "id"],
        directFn: ifconfig__NetDevice.filter,
        baseParams: { '__exclude__': { 'devname': 'lo' } }
      }),
      buttons: [ {
        text: "",
        icon: MEDIA_URL + "/icons2/16x16/actions/reload.png",
        tooltip: "{% trans 'Reload' %}",
        handler: function(self){
          nfsGrid.store.reload();
        }
      } ],
      options: {
        graphType: 'Network',
        backgroundGradient1Color: 'rgb(0,183,217)',
        backgroundGradient2Color: 'rgb(4,112,174)',
        nodeFontColor: 'rgb(29,34,43)',
        calculateLayout: false
      }
    }));
    Ext.oa.Ifconfig__NetDevice_Panel.superclass.initComponent.apply(this, arguments);
    this.on("saveallchanges", function(obj){
      this.canvas.updateConfig({data: obj});
      this.canvas.redraw();
    }, this);
  },
  onRender: function(){
    Ext.oa.Ifconfig__NetDevice_Panel.superclass.onRender.apply(this, arguments);
    this.on("leftclick", this.nodeOrEdgeClicked, this);
    this.store.on("datachanged", this.updateView, this);
    this.store.reload();
  },
  updateView: function(){
    // Sort our devices into groups by devtype. Each group that has nodes will then be drawn as a column.
    var devgroups = {
      native:  [],
      vlan:    [],
      bridge:  [],
      bonding: []
    };
    var devmap = {};
    var grouplen = {
      native:  0,
      vlan:    0,
      bridge:  0,
      bonding: 0
    };
    var maxgroup = "";
    var maxlength = 0;
    this.store.data.each(function(record){
      devgroups[record.data.devtype].push(record.json);
      devmap[record.data.devname] = record.json;
      grouplen[record.data.devtype]++;
      if( grouplen[record.data.devtype] > maxlength ){
        maxgroup  = record.data.devtype;
        maxlength = grouplen[record.data.devtype];
      }
    });

    console.log(
      String.format("We have {0} native, {1} bonding, {2} vlan, and {3} bridge devices.",
      grouplen["native"], grouplen["bonding"], grouplen["vlan"], grouplen["bridge"] )
    );
    console.log(
      String.format("Will start drawing with the {0} device group.", maxgroup)
    );

    // For now, the coordinates are VIRTUAL coordinates because those are easier to calculate.
    // Those virtual coordinates place the top right device at (0,0) and then move
    // to the left bottom side by using negative coordinates.
    // The advantage of this system is that we can use array indexes to calculate our
    // virtual coordinates, and get the final ones by multiplying the virtuals with a
    // given step size in pixels.

    var srcnodes = [];
    var haveids  = [];

    // The `offset' value is added to every Y coordinate for the current devgroup in order
    // to render devgroups with less than `maxlength' devices in it centered vertically.
    // startX and startY define the coordinates of the current node WITHOUT the offset.

    var renderDevice = function( dev, offset, startx, starty ){
      if( dev.devname in haveids )
        return;
      console.log( "Render Device " + dev.devname + " at (" + startx + "," + (offset + starty) + ")" );
      srcnodes.push({ id: dev.devname, x: startx, y: (offset + starty) });
      haveids.push(dev.devname);
      if( dev.devtype === "bridge" && dev.brports.length > 0 ){
        var nextoffset = (maxlength - dev.brports.length) / 2.0 * -1;
        for( var i = 0; i < dev.brports.length; i++ ){
          renderDevice( devmap[dev.brports[i].devname], nextoffset, startx - 1, starty - i );
        }
      }
      else if( dev.devtype === "bonding" && dev.slaves.length > 0 ){
        var nextoffset = (maxlength - dev.slaves.length) / 2.0 * -1;
        for( var i = 0; i < dev.slaves.length; i++ ){
          renderDevice( devmap[dev.slaves[i].devname], nextoffset, startx - 1, starty - i );
        }
      }
    }

    var currgroup = "bridge"; // TODO: Iterate over groups because we might not have any bridges
    for( var i = 0; i < grouplen[currgroup]; i++ ){
      console.log( "Init render: " + devgroups[currgroup][i].devname );
      var offset = (maxlength - grouplen[currgroup]) / 2.0 * -1;
      renderDevice( devgroups[currgroup][i], offset, 0, i );
    }

    // (baseX,baseY) defines where in the canvas our virtual (0,0) will be located.
    // stepX and stepY define the step size that will be taken if the virtual coords move by 1.

    var baseX = 4 * 250,
        baseY = 0,
        stepX = 250,
        stepY = 100;

    for( var i = 0; i < srcnodes.length; i++ ){
      // Translate the virtual coordinates into real ones and add the Node with those coordinates.
      var realX =  baseX + (stepX * srcnodes[i].x),
          realY = (baseY + (stepY * srcnodes[i].y)) * -1;
      // Work around the arrow heads not appearing when two nodes have the same Y coordinate
      // by adding i to it. This moves the nodes by a few pixels which the user won't even notice.
      realY += i;
      console.log( "Adding Node " + srcnodes[i].id + " at (" + realX + "," + realY + ")" );
      this.addNode({id: srcnodes[i].id,  color: 'rgb(255,0,0)', shape: 'square', size: 1, x: realX, y: realY});
    }

    this.store.data.each(function(record){
      var dev = record.json;
      if( dev.devtype === "bridge" && dev.brports.length > 0 ){
        for( var i = 0; i < dev.brports.length; i++ ){
          this.addEdge({id1: dev.devname,  id2: dev.brports[i].devname, color: 'rgb(51,12,255)', width: '1', type: 'bezierArrowHeadLine'});
        }
      }
      else if( dev.devtype === "bonding" && dev.slaves.length > 0 ){
        for( var i = 0; i < dev.slaves.length; i++ ){
          this.addEdge({id1: dev.devname,  id2: dev.slaves[i].devname, color: 'rgb(51,12,255)', width: '1', type: 'bezierArrowHeadLine'});
        }
      }
    }, this);

    this.updateOrder();
    this.saveMap();
  },
  nodeOrEdgeClicked: function(obj, evt){
    if( typeof obj.nodes !== "undefined" ){
      var clicked = obj.nodes[0];
      console.log( "You clicked on the device " + clicked.id );
    }
    else if( typeof obj.edges !== "undefined" ){
      var clicked = obj.edges[0];
      console.log( "You clicked on the edge between device " + clicked.id1 + " and " + clicked.id2 );
    }
  }
});

Ext.reg("ifconfig__netdevice_panel", Ext.oa.Ifconfig__NetDevice_Panel);

Ext.oa.Ifconfig__NetDevice_Module = Ext.extend(Object, {
  panel: "ifconfig__netdevice_panel",
  prepareMenuTree: function(tree){
    tree.appendToRootNodeById("menu_system", {
      text: 'Network',
      icon: MEDIA_URL + '/icons2/22x22/places/gnome-fs-network.png',
      panel: 'ifconfig__netdevice_panel_inst',
      children: [ {
        text: 'General',
        leaf: true, href: '#',
        icon: MEDIA_URL + '/icons2/22x22/apps/network.png',
        panel: 'ifconfig__netdevice_panel_inst'
      }, {
        text: 'Proxy',
        leaf: true, href: '#',
        icon: MEDIA_URL + '/icons2/22x22/apps/preferences-system-network-proxy.png'
      }, {
        text: 'Domain',
        icon: MEDIA_URL + '/icons2/128x128/apps/domain.png',
        children: [
          {text: 'Active Directory',  leaf: true, href: '#'},
          {text: 'LDAP',              leaf: true, href: '#'}
        ]
      } ]
    });
  }
});


window.MainViewModules.push( new Ext.oa.Ifconfig__NetDevice_Module() );

// kate: space-indent on; indent-width 2; replace-tabs on;
