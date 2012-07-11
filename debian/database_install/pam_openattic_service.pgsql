# This service definition is used by other services that need to authenticate
# openATTIC users, most notably ProFTPd. First of all, it includes the
# "openattic" service definition to stay in sync with the authentication
# that openATTIC itself is using, and in case this file is empty (which is
# the default), we authenticate against openATTIC's PGSQL database.
#
# You should never need to change this file.
#
# If you want to change the way openATTIC authenticates its users, e.g. in
# order to authenticate against Active Directory, please do so in
# /etc/pam.d/openattic.

@include openattic

auth        required    pam_pgsql.so
account     required    pam_pgsql.so
password    required    pam_pgsql.so
session     required    pam_pgsql.so
