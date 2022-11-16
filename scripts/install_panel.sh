#!/bin/sh
clear
Font_Black="\033[30m"
Font_Red="\033[31m"
Font_Green="\033[32m"
Font_Yellow="\033[33m"
Font_Blue="\033[34m"
Font_Purple="\033[35m"
Font_SkyBlue="\033[36m"
Font_White="\033[37m"
Font_Suffix="\033[0m"

service_name="PortForwardGoPanel"

echo -e "${Font_SkyBlue}PortForwardGoPanel installation script${Font_Suffix}"

while [ $# -gt 0 ]; do
    case $1 in
    --service)
        service_name=$2
        shift
        ;;
    *)
        echo -e "${Font_Red} Unknown param: $1 ${Font_Suffix}"
        exit
        ;;
    esac
    shift
done

if [ -z "${service_name}" ]; then
    echo -e "${Font_Red}param 'service' not found${Font_Suffix}"
    exit 1
fi

echo -e "${Font_Yellow} ** Checking system info...${Font_Suffix}"
case $(uname -m) in
x86_64)
    arch="amd64"
    ;;
armv7*)
    arch="armv7"
    ;;
aarch64)
    arch="arm64"
    ;;
s390x)
    arch="s390x"
    ;;
*)
    echo -e "${Font_Red}Unsupport architecture${Font_Suffix}"
    exit 1
    ;;
esac

if [[ ! -e "/usr/bin/systemctl" ]] && [[ ! -e "/bin/systemctl" ]]; then
    echo -e "${Font_Red}Not found systemd${Font_Suffix}"
    exit 1
fi

while [ -f "/etc/systemd/system/${service_name}.service" ]; do
    read -p "Service ${service_name} is exists, please input a new service name: " service_name
done

dir="/opt/${service_name}"
while [ -d "${dir}" ]; do
    read -p "${dir} is exists, please input a new dir: " dir
done

echo -e "${Font_Yellow} ** Checking release info...${Font_Suffix}"
vers=$(curl -sL https://gitlab.com/api/v4/projects/CoiaPrant%2FPortForwardGo/releases | grep "tag_name" | head -n 1 | awk -F ":" '{print $2}' | awk -F "," '{print $1}' | sed 's/\"//g;s/,//g;s/ //g' | awk -F "v" '{print $2}')
if [ -z "${vers}" ]; then
    echo -e "${Font_Red}Unable to get releases info${Font_Suffix}"
    exit 1
fi
echo -e " Detected lastet version: " ${vers}

echo -e "${Font_Yellow} ** Download release info...${Font_Suffix}"

curl -L -o /tmp/PortForwardGo.tar.gz "https://gitlab.com/CoiaPrant/PortForwardGo/-/releases/v"${vers}"/downloads/PortForwardGoPanel_"${vers}"_linux_"${arch}".tar.gz"
if [ ! -f "/tmp/PortForwardGo.tar.gz" ]; then
    echo -e "${Font_Red}Download failed${Font_Suffix}"
    exit 1
fi

tar -xvzf /tmp/PortForwardGo.tar.gz -C /tmp/
if [ ! -f "/tmp/PortForwardGoPanel" ]; then
    echo -e "${Font_Red}Decompression failed${Font_Suffix}"
    exit 1
fi

if [ ! -f "/tmp/systemd/PortForwardGoPanel.service" ]; then
    echo -e "${Font_Red}Decompression failed${Font_Suffix}"
    exit 1
fi

while [[ "${db}" != "mysql" ]] && [[ "${db}" != "sqlite3" ]]; do
    read -p "please input database type [mysql, sqlite3]: " db
done

if [[ "${db}" == "mysql" ]]; then
    read -p "please input database host (default: localhost): " db_host
    if [ -z "${db_host}" ]; then
        db_host="localhost"
    fi

    read -p "please input database port (default: 3306): " db_port
    if [ -z "${db_port}" ]; then
        db_port="3306"
    fi

    read -p "please input database user (default: root): " db_user
    if [ -z "${db_user}" ]; then
        db_user="root"
    fi

    while [ -z "${db_pass}" ]; do
        read -p "please input database password: " db_pass
    done

    while [ -z "${db_name}" ]; do
        read -p "please input database name: " db_name
    done

    cp /tmp/examples/panel_mysql.json /tmp/examples/panel.json
    sed -i "s#{DB_HOST}#${db_host}#g" /tmp/examples/panel.json
    sed -i "s#3306#${db_port}#g" /tmp/examples/panel.json
    sed -i "s#{DB_USER}#${db_user}#g" /tmp/examples/panel.json
    sed -i "s#{DB_PASS}#${db_pass}#g" /tmp/examples/panel.json
    sed -i "s#{DB_NAME}#${db_name}#g" /tmp/examples/panel.json
elif [[ "${db}" == "sqlite3" ]]; then
    cp /tmp/examples/panel_sqlite.json /tmp/examples/panel.json
fi

db_host="127.0.0.1"
db_port="3306"
db_user=""
db_pass=""
db_name=""

mkdir -p ${dir}
chmod 777 /tmp/PortForwardGoPanel
mv /tmp/PortForwardGoPanel ${dir}
mv /tmp/examples/panel.json ${dir}
mv /tmp/resources ${dir}
mv /tmp/install ${dir}

mv /tmp/systemd/PortForwardGoPanel.service /etc/systemd/system/${service_name}.service
sed -i "s#{dir}#${dir}#g" /etc/systemd/system/${service_name}.service

rm -rf /tmp/*

echo -e "${Font_Yellow} ** Starting program...${Font_Suffix}"
systemctl daemon-reload
systemctl enable --now ${service_name}

echo -e "${Font_Green} [Success] Completed installation${Font_Suffix}"
