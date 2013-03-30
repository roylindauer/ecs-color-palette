#----------------------------------------------------------------------------
# You will need to create a cert to compile this into an AIR app
# $shell > adt -certificate -cn $CERTNAME 2048-RSA $CERTFILE.p12 '$PASSWORD'
#----------------------------------------------------------------------------
adt -package -storetype pkcs12 -keystore ECSColorPalette.p12 ECSColorPalette.air ECSColorPalette.xml ECSColorPalette.html AIRAliases.js AIRIntrospector.js AIRLocalizer.js AIRMenuBuilder.js AIRSourceViewer.js assets/.