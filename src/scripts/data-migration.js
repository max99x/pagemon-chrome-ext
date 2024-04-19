class DataMigrationService {
  constructor() {
    this.database = new SQLiteDatabaseService();
    this.oldDatabase = new WebSQLDBService();
    this.oldDatabase.initializeDB();
    this.pages = new PagesService()
  }

  handle = async () => {
    this.oldDatabase.executeSql(`SELECT * FROM pages`, null, async pages => {
      try {
        if (pages.rows.length > 0) {
          let pagesArray = Array.from(pages.rows);
          await Promise.all(pagesArray.map(page => this.pages.addPage(page)))
          chrome.runtime.sendMessage({
            data: { jobs: pagesArray },
            type: 'dataMigrated'
          });
          this.oldDatabase.executeSql(`DELETE FROM pages`)
        }
      } catch (error) {
        console.log(error)
      }
    });
  }
}