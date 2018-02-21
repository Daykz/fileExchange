const WD_T = 'work_directory/temp';
const WD_U = 'work_directory/unknow';
const WD_NE = 'work_directory/notExist';

const conf = (id) => {
  return ({
    'wd_temp':  {
       REP_DEST: `/tmp/${WD_T}/files/`,
       REP_EVENT: `/tmp/${WD_T}/metas/`,
    },
    'wd_unknow': {
      REP_DEST: `/tmp/${WD_U}/files/`,
      REP_EVENT: `/tmp/${WD_U}/metas/`,
      EXEC: `echo -n 'Dave tu commences a être chaud chacaaaal' > /tmp/${WD_U}/exec_test.txt`,
    },
    'wd_doesnt_exist': {
      REP_DEST: `/tmp/${WD_NE}/files/`,
      REP_EVENT: `/tmp/${WD_NE}/metas/`,
    }
  })[id]
}

module.exports = conf;
/*

  id (wd_temp || wd_unknow || ...) === id envoyé en params a l'envoie de fichier.
    ex : node bin.js src=.... dest=.... id=wd_temp op=upload
  
  REP_DEST === répertoire destination pour le fichier envoyé.

  REP_EVENT === répertoire pour les métadonées crées à l'envoi.
  
  EXEC === Cmd a éxecuter en fonction de l'id. (n'est pas forcement la tout le temps).
  
      infos supp:
      
  Si les répertoires n'existent pas ... tu dois les créér ! pas de messages d'erreurs, sauf si la création échoue.
  Et le messages d'erreur doit être clair

*/
