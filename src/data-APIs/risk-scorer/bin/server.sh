#!/bin/bash -xv
#
#  Copyright (c) 2015 Intel Corporation 
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

echo "Starting ref-arch-rest-api startup script"

JAVA_VERSION="7u79"
JAVA_DIST="jdk-${JAVA_VERSION}-linux-x64"
JAVA_PACK="jdk1.7.0_79"
if [[ ! -d "${JAVA_DIST}" ]]
then
  wget -q --no-check-certificate --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/${JAVA_VERSION}-b15/${JAVA_DIST}.tar.gz
  tar zxf "${JAVA_DIST}.tar.gz"
fi
export JAVA_HOME=`pwd`/${JAVA_PACK}
#DBG ls
#DBG
ls $JAVA_HOME
export PATH=$PATH:${JAVA_HOME}/bin
which java
java -version

SPARK_VERSION="1.5.0"
SPARK_DIST="spark-${SPARK_VERSION}-bin-hadoop2.6"
if [[ ! -d "${SPARK_DIST}" ]]
then
  # Set up Spark runtime.
  #wget -q "http://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/${SPARK_DIST}.tgz"
  #wget "http://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/${SPARK_DIST}.tgz"
  wget -q "http://d3kbcqa49mib13.cloudfront.net/${SPARK_DIST}.tgz"
  #DBG ls -l
  tar zxf "${SPARK_DIST}.tgz"
  #DBG du -hs "${SPARK_DIST}"
fi

export SPARK_HOME=`pwd`/${SPARK_DIST}
#DBG ls $SPARK_HOME
export PYTHONPATH=$PYTHONPATH:${SPARK_HOME}/python:${SPARK_HOME}/python/lib/py4j-0.8.2.1-src.zip

python server.py

