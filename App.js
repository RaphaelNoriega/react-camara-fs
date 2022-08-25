
//importante es otorgar los permisos para poder guardar la imagen

import React, { useState, useEffect,useRef } from 'react'
import {  StyleSheet, Text, TouchableOpacity, View,ScrollView, PermissionsAndroid,Image } from 'react-native';
import { RNCamera } from 'react-native-camera';
import moment from "moment";

//IMPORTANT: when using ExternalStorageDirectoryPath it's necessary 
//to request permissions (on Android) to read and write on the external storage,
// here an example: React Native Offical Doc

//   readDir(dirpath: string): Promise<ReadDirItem[]>


//bueno ya esta tomando las fotos, y las guarda en la carpeta Fotos, no en la carpeta Facturacion en sitio
//es necesario checar el por que esta pasando eso, pero de moemnto me conformo my nigga


//image moved undefined es decir no lo guarda en el directorio que se le indico, pero por default
//como que si no encuentra lo guarda por default en la carpete fotos, asi mero, depues lo vamos a guardad en otra parte
///tengo que ver por que no esta haciendo lo que le digo....


const App = ()=> {
  const RNFS = require('react-native-fs');
  const dirPicutures = `${RNFS.ExternalStorageDirectoryPath}/FacturacionSitio/Fotos`  
  //const dirPicutures = `${RNFS.ExternalDirectoryPath}/FacturacionSitio/Fotos`  
  //const dirPicutures = `${RNFS.DocumentDirectoryPath}/FacturacionSitio/Fotos`  
  //myAppName es el nombre de la carpeta que se crea y Fotos es la carpeta que se hace dentro de myAppName
  //

  const [vistaFotos,setVistaFotos] = useState(false)
  const [arregloFotos,setArregloFotos]=useState([])

  const moveAttachment = async (filePath, newFilepath) => {
    console.log('entra la funcion')
      RNFS.mkdir(dirPicutures)
        .then(() => {
          RNFS.moveFile(filePath, newFilepath)
            .then(() => {//le falta el response o ponerle un indicativo e
              console.log('FILE MOVED', filePath, newFilepath);
              //resolve(true);  //me sale error cuando intenta el resolve, como que no reconoce el comando, si lo queit todo fuciona
              console.log('supuestamente se guardo la imagen')
            })
            .catch(error => {
              console.log('moveFile error', error);
              reject(error); //a lo mejor hay que hacer algo similar con el reject, anteriomente me dio error
            });
        }) 
        .catch(err => {
          console.log('mkdir error', err);
          reject(err);
        });
  };
  
  const saveImage = async (filePath) => {
    console.log('deveria de estar guardando la imagen')

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Facturacion Sitio",
          message:
            "Facturacion en Sitio App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("puedes guardar la foto");
        
          try {
            console.log('entro el try')
            // set new image name and filepath
            //la parte (lo que sea aqui es la funcion donde se guarda el nombre de la imaguen compuesta por NIS/fecha/hora)
            const newImageName = `lo que sea aqui_ ${moment().format('DDMMYY_HHmmSSS')}.jpg`;
            console.log('Nombre de la imagen...')
            console.log(newImageName)
            const newFilepath = `${dirPicutures}/${newImageName}`;
            console.log('Nombre de la direccion de la carpeta')
            console.log(newFilepath)
            // move and save image to new filepath
            const imageMoved = await moveAttachment(filePath, newFilepath);
            console.log('Es a donde se mueve')
            console.log('image moved', imageMoved);
          } catch (error) {
            console.log('No esta guardadno en el telefono')
            console.log(error);
          }
      }
    } catch (err) {
      console.warn(err);
    }
  };


const takePicture = async() => {
  console.log('Toma la foto')
  if (cameraRef) {
    try {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
    
      alert(data.uri);
      saveImage(data.uri);
      
    } catch (error) {
      console.log(error)
    }
  }
};

//el contenido de esta funcion es lo que me traje directamente de la documentacion solo le cambie el pat donde estan guardanod las fotos

const getFiles =()=>{
  console.log('mostrando datos')
    // obtiene un arreglo en donde estan los links de las fotos guardadas
    RNFS.readDir(dirPicutures) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
    .then((result) => {
      console.log('GOT RESULT', result);
      setArregloFotos(result)

      // stat the first file
      return Promise.all([RNFS.stat(result[0].path), result[0].path]);
    })
    .then((statResult) => {
      if (statResult[0].isFile()) {
        // if we have a file, read it
        return RNFS.readFile(statResult[1], 'utf8');
      }

      return 'no file';
    })
    .then((contents) => {
      // log the file contents
      console.log(contents);
    })
    .catch((err) => {
      console.log(err.message, err.code);
    });
}

//botones para la vista de las fotos
const verFotos =()=>{
  console.log('muestra las fotos');
  setVistaFotos(false)
}

const regresa =()=>{
  console.log('muestra las fotos');
  setVistaFotos(true)
}

const clikImagen = (name) =>{
  console.log('le diste clik a esta imagen',name)
}

//const path = "file://"+dirPicutures+
// const source={{uri: `file://${directoryPath}/${image.path}`}}
// <Image source={"file://"+dirPicutures+image.path} style={{ width: 150, height: 150}} />

const ImageMap = () =>
  arregloFotos.map((image,i) => (
    <View key={i}>
       <TouchableOpacity onPress={() => clikImagen(image.name)}>
        <Image source={{uri:"file://" +  image.path} } style={{ width: 150, height: 150}} />
        <Text style={{ textAlign: "center" }}>{image.name}</Text>
      </TouchableOpacity>
    </View>
   
  ));

  let cameraRef = useRef(null)
    return (
      <>
      {vistaFotos ?
          <View style={styles.container}>
          <RNCamera
            ref={cameraRef}
            style={styles.preview}
            flashMode={RNCamera.Constants.FlashMode.on}
            ratio={"3:2"}
  
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            androidRecordAudioPermissionOptions={{
              title: 'Permission to use audio recording',
              message: 'We need your permission to use your audio',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
          ></RNCamera>
  
        
        <View style={{flexDirection:'row'}}>
            <View style={styles.snapWrapper3}>
              <TouchableOpacity 
              onPress={()=> takePicture()} 
              style={styles.capture}>
                <Text style={{ fontSize: 14 }}> SNAP </Text>
                
              </TouchableOpacity>
            </View>
            <View >
              <TouchableOpacity 
              onPress={()=> verFotos()} 
              style={styles.verFotos}>
                <Text style={{ fontSize: 14 }}> Fotos </Text>
              </TouchableOpacity>
            </View>
          </View>
        
        </View>
  
       : 
       <>
       <View>
          <Text style={styles.Texto}>Muestra las fotos</Text>
            <View style={{flexDirection:'row'}} >
              <TouchableOpacity 
              onPress={()=> regresa()} 
              style={styles.Regresa}>
                <Text style={{ fontSize: 14 }}> Retrun </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
              onPress={()=> getFiles()} 
              style={styles.MuestraData}>
                <Text style={{ fontSize: 14 }}>SHOW DATA </Text>
              </TouchableOpacity>
            </View>

            {arregloFotos && (
              <>
              <ScrollView style={styles.scrollView}>
                <ImageMap/>
              </ScrollView>
              
              </>
            )}
       </View>
       </>
       }
      </>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  verFotos: {
    flex: 0,
    backgroundColor: '#CDDC39',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  Regresa: {
    flex: 0,
    backgroundColor: '#AB47BC',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  MuestraData: {
    flex: 0,
    backgroundColor: '#FFEB3B',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  snapWrapper3: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'absolute',
    bottom:20,
    left: 16,
    right: 16,
  },
  Texto: {
    textAlign: 'center',
   marginTop:20,
   fontSize:25,
   fontWeight:'bold'
  },
  scrollView: {
    backgroundColor: '#EEEEEE',
    marginHorizontal: 20,
  },
});

export default App;



/**  
 * SE IMPLEMENTAR AUN BUSCADOR POR NOMBRE DE IMAGEN PARA PODER TRAERLA Y QUE SIEMPRE SE ESTE MOSTRANDO, ESO PUES SE AGREGARA EN 
 * UN useState, y sobre todo bajo la condicion focus, siempre
 * 
 * 
 * 
 * FALTA AGREGARLE UN CONDICIONAMIENTO, ES DECIR QUE VERIFIQUE QUE SI ESTEN LAS FOTOS EN LA CARPTE, PUES QUE SUCEDE SI SE LE QUIERA
 * LA MEMORIA EXTERNA, QUE SI NO ENCUENTRA UN PAT EXTERNO QUE LOS GUARDE EN EL TELEFONO INTERNAMENTE Y QUE LE SALGA UNAS OPCIONES
 * DE QUE ES LOQ EU DECIDE HACE,,VALIDACIONES VALIDACIONES....!
 * state = {source:null}

async componentDidMount() {    

  async loadFile ( path ){
    await this.setState({source:{uri:path}})
  }

  const path = RNFS.DocumentDirectoryPath+'/images/d88b102c-d4c6-4dc1-9a4c-f2a0e599ddbf.jpg'
//const path = "file://"+RNFS.DocumentDirectoryPath+'/images/d88b102c-d4c6-4dc1-9a4c-f2a0e599ddbf.jpg'

  await RNFS.exists(path).then( exists => {
        if(exists){
          this.loadFile(path);
      }
 }

   renderItem = ({ item }) => (
      <View key={item.Id} >
        <View>
          <TouchableOpacity onPress={() => this.onPressItem(item)}>
          <Text>{item.cardName}</Text>  
          <Image 
          source={this.state.source}
          style={{ width:'auto', height: 55 }}
          />
          </TouchableOpacity>
        </View>
      </View>
    );



    //HACE FALTA AGREGAR EL MODAL QUE CUANDO EL LECTURISTA ESTE EN LA VISTA DE FORMULARIO DE LECTURA QUE ESTE PUEDA
    AGRANDAR LA FOTO EN PANTALLA COMPLETA CON UN MODAL 

    ALGO ASI
    return (
      <View>
        <TouchableOpacity onPress={() => this.showSlider()}>
          <Image uri={post.images[1].url} tint="light" />
        </TouchableOpacity>
        <Modal
          visible={this.state.modalVisible}
          transparent={true}
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <ImageViewer imageUrls={IMAGES} />
        </Modal>
      </View>
    );
 */
