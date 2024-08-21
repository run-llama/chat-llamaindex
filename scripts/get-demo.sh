#!/bin/bash
# downloads demo datasources

pushd datasources

# redhat
mkdir redhat
pushd redhat
wget -nc https://docs.redhat.com/en-us/documentation/red_hat_enterprise_linux/9/pdf/configuring_basic_system_settings/Red_Hat_Enterprise_Linux-9-Configuring_basic_system_settings-en-US.pdf
popd

# watchos
mkdir watchos
pushd watchos
wget -nc https://help.apple.com/pdf/watch/10/en_US/apple-watch-user-guide-watchos10.pdf
popd

# basic_law_germany
mkdir basic_law_germany
pushd basic_law_germany
wget -nc https://www.gesetze-im-internet.de/englisch_gg/englisch_gg.html
popd

# documents (empty folder)
mkdir documents

popd
