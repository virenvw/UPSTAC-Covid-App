# UPSTAC-Covid-App
Application on Health care management for Covid patients.
UPSTAC Blockchain Network is built on hyperledger and has below network architecture :

* 4 Organizations (HospitalA, HospitalB, Government, Insurance)
* 2 Peers for HospitalA
* 2 Peers for HospitalB
* 2 Peer for Government
* 1 Peer for insurance
* TLS enabled
* Common channel(common) between hospitalA, hospitalB, Government and Insurance
* Common chaincode(common) between hospitalA, hospitalB, Government and Insurance
* Private channel(insurance-hospitala) between hospitalA and Insurance
* Private chaincode(insure) between hospitalA and Insurance
