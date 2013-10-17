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

import dbus

from django.db import models
from django.conf import settings

from systemd.helpers import dbus_to_python
from ifconfig.models import Host, HostDependentManager, getHostDependentManagerClass
from volumes.models import VolumePool, FileSystemVolume, CapabilitiesAwareManager

from btrfs import filesystems


class Btrfs(VolumePool):
    name        = models.CharField(max_length=150)
    host        = models.ForeignKey(Host)

    objects     = HostDependentManager()
    all_objects = models.Manager()

    @property
    def dbus_object(self):
        return dbus.SystemBus().get_object(settings.DBUS_IFACE_SYSTEMD, "/zfs")

    @property
    def fullname(self):
        return self.name

    @property
    def fs(self):
        return filesystems.Btrfs(self)

    @property
    def type(self):
        return "Btrfs"

    @property
    def status(self):
        return "ok"

    @property
    def megs(self):
        return self.fs.stat["size"]

    @property
    def usedmegs(self):
        return self.fs.stat["used"]


class BtrfsSubvolume(FileSystemVolume):
    name        = models.CharField(max_length=150)
    btrfs       = models.ForeignKey(Btrfs)
    parent      = models.ForeignKey('self', blank=True, null=True)
    filesystem  = "btrfs"

    objects     = getHostDependentManagerClass("btrfs__host")()
    all_objects = models.Manager()

    @property
    def fs(self):
        return filesystems.Btrfs(self)

    @property
    def fsname(self):
        return "btrfs"

    @property
    def status(self):
        return self.btrfs.status

    @property
    def mountpoint(self):
        return self.fs.mountpoint

    @property
    def mounthost(self):
        return self.fs.mounthost

    @property
    def mounted(self):
        return self.fs.mounted

    @property
    def stat(self):
        return self.fs.stat

    @property
    def megs(self):
        return self.btrfs.megs

    @property
    def host(self):
        return self.btrfs.host

    @property
    def fullname(self):
        if self.parent is not None:
            parentname = self.parent.fullname
        else:
            parentname = self.btrfs.name
        return "%s/%s" % (parentname, self.name)

    def __unicode__(self):
        return self.fullname
