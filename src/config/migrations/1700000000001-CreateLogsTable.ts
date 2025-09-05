import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateLogsTable1700000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'log',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'userId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'datetime',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'entity',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'entityId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'action',
                        type: 'enum',
                        enum: ['CREATE', 'UPDATE', 'DELETE'],
                        isNullable: false,
                    },
                    {
                        name: 'changedFields',
                        type: 'json',
                        isNullable: false,
                    },
                    {
                        name: 'functionUsed',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Adiciona chave estrangeira para users
        await queryRunner.createForeignKey(
            'log',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('log');
    }
} 