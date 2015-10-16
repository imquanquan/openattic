# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

"""
 *  Copyright (C) 2011-2014, it-novum GmbH <community@open-attic.org>
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

from django.core.management.base import BaseCommand

from ceph.models import Bucket, OSD

class Command( BaseCommand ):
    help = "Dump the Ceph OSD tree as known to openATTIC."

    def handle(self, **options):
        for rootnode in Bucket.objects.root_nodes():
            print " *", rootnode
            for descendant in rootnode.get_descendants():
                print "  " * descendant.level, "*", descendant
                for osd in descendant.osd_set.all():
                    print "  " * descendant.level, "  * ", osd