DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS DocumentConnection;
DROP TABLE IF EXISTS Stakeholder;
DROP TABLE IF EXISTS Location;
DROP TABLE IF EXISTS TypeDocument;
DROP TABLE IF EXISTS Connection;
DROP TABLE IF EXISTS Document;

delete from Document where IdDocument =127;
DROP TABLE IF EXISTS Scale;

select * from Document 

DELETE FROM DocumentConnection
DELETE FROM Location
DELETE FROM Document
delete from Scale where IdScale >=4
delete from Stakeholder where IdStakeholder >= 7
delete from TypeDocument where IdType >= 9