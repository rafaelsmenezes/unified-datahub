#!/bin/bash

# Script to update imports after modular architecture refactoring

cd "$(dirname "$0")"

echo "Updating imports..."

# Find all TypeScript files
find src test -name "*.ts" -type f | while read file; do
  # Update imports for domain layer
  sed -i "s|from 'src/domain/entities/unified-data.entity'|from 'src/ingestion/domain/entities/unified-data.entity'|g" "$file"
  sed -i "s|from '../domain/entities/unified-data.entity'|from '../../../ingestion/domain/entities/unified-data.entity'|g" "$file"
  sed -i "s|from '../../domain/entities/unified-data.entity'|from '../../ingestion/domain/entities/unified-data.entity'|g" "$file"
  sed -i "s|from '../../../domain/entities/unified-data.entity'|from '../../../ingestion/domain/entities/unified-data.entity'|g" "$file"
  
  sed -i "s|from 'src/domain/repositories/unified-data.repository.interface'|from 'src/dataset/domain/repositories/unified-data.repository.interface'|g" "$file"
  sed -i "s|from '../../../domain/repositories/unified-data.repository.interface'|from '../../../dataset/domain/repositories/unified-data.repository.interface'|g" "$file"
  
  sed -i "s|from 'src/domain/ingestion/|from 'src/ingestion/domain/interfaces/|g" "$file"
  sed -i "s|from '../../domain/ingestion/|from '../../domain/interfaces/|g" "$file"
  sed -i "s|from '../../../domain/ingestion/|from '../domain/interfaces/|g" "$file"
  
  sed -i "s|from 'src/domain/http/http-client.interface'|from 'src/shared/infrastructure/http/http-client.interface'|g" "$file"
  sed -i "s|from '../../domain/http/http-client.interface'|from '../../infrastructure/http/http-client.interface'|g" "$file"
  sed -i "s|from '../../../domain/http/http-client.interface'|from '../http/http-client.interface'|g" "$file"
  
  # Update imports for application layer
  sed -i "s|from 'src/application/use-cases/ingestion.usecase'|from 'src/ingestion/application/use-cases/ingestion.usecase'|g" "$file"
  sed -i "s|from 'src/application/use-cases/query-data.usecase'|from 'src/dataset/application/use-cases/query-data.usecase'|g" "$file"
  sed -i "s|from 'src/application/use-cases/get-data-by-id.usecase'|from 'src/dataset/application/use-cases/get-data-by-id.usecase'|g" "$file"
  
  # Update imports for infrastructure
  sed -i "s|from '../infrastructure/ingestion/ingestion.module'|from '../ingestion/ingestion.module'|g" "$file"
  sed -i "s|from '../persistence/persistence.module'|from '../../../dataset/infrastructure/persistence/persistence.module'|g" "$file"
  sed -i "s|from '../http/http.module'|from '../../../shared/infrastructure/http/http.module'|g" "$file"
  sed -i "s|from '../sources/sources.module'|from '../../../shared/infrastructure/sources/sources.module'|g" "$file"
  
  sed -i "s|from './repository/mongo-unified-data.repository'|from '../repository/mongo-unified-data.repository'|g" "$file"
  sed -i "s|from './models/mongo-unified-data.schema'|from '../models/mongo-unified-data.schema'|g" "$file"
  
  # Update imports for config
  sed -i "s|from './config/database.config'|from './shared/config/database.config'|g" "$file"
  sed -i "s|from './config/sources.config'|from './shared/config/sources.config'|g" "$file"
  sed -i "s|from './config/ingestion.config'|from './shared/config/ingestion.config'|g" "$file"
  
  # Update imports for interfaces
  sed -i "s|from './interfaces/ingestion-source.interface'|from '../interfaces/ingestion-source.interface'|g" "$file"
  sed -i "s|from './batch/batch-saver.service'|from './batch-saver.service'|g" "$file"
  sed -i "s|from './stream/stream-generator.service'|from './stream-generator.service'|g" "$file"
  
  sed -i "s|from './rest/data.controller'|from '../../dataset/interfaces/rest/data.controller'|g" "$file"
  sed -i "s|from './rest/admin.controller'|from '../../ingestion/interfaces/rest/admin.controller'|g" "$file"
  
  sed -i "s|from './pipes/query-data-transform.pipe'|from '../pipes/query-data-transform.pipe'|g" "$file"
  sed -i "s|from '../dto/query-data.dto'|from '../dto/query-data.dto'|g" "$file"
  sed -i "s|from './swagger/admin.swagger'|from '../swagger/admin.swagger'|g" "$file"
done

echo "Import updates complete!"
