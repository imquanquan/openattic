Ext.namespace("Ext.oa");

Ext.oa.Lvm__Partitions_Panel = Ext.extend(Ext.grid.GridPanel, {
  initComponent: function(){
    var partStore = new Ext.data.JsonStore({
      fields: [ "begin", "end", "flags-set", "number", "partition-name", "filesystem-type", "size" ],
      data: []
    });
    Ext.apply(this, Ext.apply(this.initialConfig, {
      store: partStore,
      colModel:  new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [{
            header: "#",
            width: 20,
            dataIndex: "number"
          }, {
            header: "Size",
            width: 100,
            dataIndex: "size"
          }, {
            header: "Begin",
            width: 100,
            dataIndex: "begin"
          }, {
            header: "End",
            width: 100,
            dataIndex: "end"
          }, {
            header: "FS Type",
            width: 100,
            dataIndex: "filesystem-type"
          }, {
            header: "Label",
            width: 100,
            dataIndex: "partition-name"
          }, {
            header: "Flags",
            width: 100,
            dataIndex: "flags-set"
        }]
      })
    }));
    Ext.oa.Lvm__Partitions_Panel.superclass.initComponent.apply(this, arguments);
    var self = this;
    lvm__VolumeGroup.get_partitions(this.device, function(provider, response){
      if( response.result ){
        var disk = response.result[0];
        self.setTitle( String.format( "{0} &mdash; {1}, {2}, {3}",
          disk["path"], disk["size"], disk["transport-type"], disk["model-name"]
        ));
        partStore.loadData( response.result[1] );
      }
    });
  }
});



Ext.oa.Lvm__Disks_Panel = Ext.extend(Ext.Panel, {
  initComponent: function(){
    Ext.apply(this, Ext.apply(this.initialConfig, {
      title: "Disk Management",
      layout: 'accordion',
      buttons: [ {
        text: "Initialize",
        handler: function(){ alert("add me to a VG"); }
      } ]
    }));
    Ext.oa.Lvm__Disks_Panel.superclass.initComponent.apply(this, arguments);
    var self = this;
    lvm__VolumeGroup.get_devices(function(provider, response){
      if( response.result ){
        for( var i = 0; i < response.result.length; i++ ){
          self.add(new Ext.oa.Lvm__Partitions_Panel({
            title: response.result[i],
            device: ('/dev/' + response.result[i])
          }));
        }
      }
    });
  },

  prepareMenuTree: function(tree){
    tree.root.attributes.children[1].children.push({
      text: 'Disk Management',
      leaf: true,
      icon: '/filer/static/icons2/22x22/apps/database.png',
      panel: this,
      href: '#',
    });
  }
});


// kate: space-indent on; indent-width 2; replace-tabs on;
