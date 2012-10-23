# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

"""
 *  Copyright (C) 2011-2012, it-novum GmbH <community@open-attic.org>
 *
 *  openATTIC is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; version 2.
 *
 *  This package is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
"""

from rpcd.handlers import ModelHandler
from rpcd.handlers import ProxyModelBaseHandler, ProxyModelHandler

from peering.models import PeerHost
from ifconfig.models import Host
from nagios.models import Command, Service, Graph

class CommandHandler(ModelHandler):
    model = Command

class GraphHandler(ModelHandler):
    model = Graph

class ServiceHandler(ModelHandler):
    model = Service
    order = ("description",)

    def write_conf(self):
        """ Update the Nagios configuration and restart Nagios. """
        Service.write_conf()

    def _override_get(self, obj, data):
        try:
            data['state']  = obj.state
        except KeyError:
            data['state']  = None
            data["graphs"] = None
        else:
            qryset = Graph.objects.filter( command=obj.command )
            if qryset.count():
                data["graphs"] = [ { "id": gr.id, "title": gr.title } for gr in qryset ]
            else:
                try:
                    data["graphs"] = [ { "id": k, "title": v } for (k, v) in obj.rrd.source_labels.items() ]
                except SystemError:
                    data["graphs"] = None

        return data


class ServiceProxy(ProxyModelHandler, ServiceHandler):
    def _find_target_host(self, id):
        dbservice = Service.all_objects.get(id=int(id))
        if dbservice.volume is not None:
            host = dbservice.volume.vg.host
        else:
            host = dbservice.host
        if host == Host.objects.get_current():
            return None
        if host is None:
            raise RuntimeError("Object is not active on any host")
        return PeerHost.objects.get(name=host.name)


RPCD_HANDLERS = [CommandHandler, ServiceProxy, GraphHandler]
