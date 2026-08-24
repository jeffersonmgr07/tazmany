/**
 * Contrato de persistencia utilizado por los servicios de dominio.
 * Una futura implementación SQL deberá conservar estas firmas y devolver los mismos DTO internos.
 */
function getDataRepository_() {
  return {
    list: function (entityName) {
      if (!TAZMANY_SCHEMA[entityName]) throw new Error('Unknown repository entity: ' + entityName);
      return getRowsAsObjects_(entityName);
    },
    findById: function (entityName, id) {
      return this.list(entityName).find(function (record) { return String(record.id) === String(id); }) || null;
    },
    upsert: function (entityName, records) {
      if (!TAZMANY_SCHEMA[entityName]) throw new Error('Unknown repository entity: ' + entityName);
      return upsertRowsById_(entityName, records);
    }
  };
}
