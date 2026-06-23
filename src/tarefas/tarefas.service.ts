import { Injectable } from '@nestjs/common';
import { connection } from '../database/database';
import { CreateTarefaDto } from './dto/create-tarefa.dto';
import { UpdateTarefaDto } from './dto/update-tarefa.dto';
import { RowDataPacket } from 'mysql2';
import{Tarefa} from './interfaces/tarefa.interface';
import { concat } from 'rxjs';
import { mergeInternals } from 'rxjs/internal/operators/mergeInternals';

@Injectable()
export class TarefasService {
    async listar(){
        const [tarefa] = await connection.query('SELECT * FROM tarefa ORDER BY id DESC');
        return tarefa;
    }

    async criar(CreateTarefaDto:CreateTarefaDto){
        const {titulo, descricao, status} = CreateTarefaDto;
        await connection.query('INSERT INTO tarefa (titulo, descricao, status) VALUES (?,?,?)',
        [titulo,descricao || '', status || 'pendente'],);
        return{
            mensagem :'Tarefa criada com sucesso!'
        };
    }
    async buscarPorId(id:number): Promise<Tarefa>{
        const [tarefas] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM tarefa WHERE id = ?', [id],
        )
        return tarefas[0] as Tarefa;

    }

    async atualizar(id:number, UpdateTarefaDto:UpdateTarefaDto){
        const tarefaAtual = await this.buscarPorId(id);

        const titulo = UpdateTarefaDto.titulo ?? tarefaAtual.titulo;
        const descricao = UpdateTarefaDto.descricao ?? tarefaAtual.descricao
        const status = UpdateTarefaDto.status ?? tarefaAtual.status;

        await connection.query(
            'UPDATE tarefa SET titulo = ?, descricao = ?, status = ? WHERE id = ?',
            [titulo,descricao,status, id]
        );
        return {
            mensagem:"Tarefa atualizada com sucesso"
        }
    }

    async remover(id:number){
        await this.buscarPorId(id);

        await connection.query('DELETE FROM tarefa WHERE id = ?', [id]);
        return{
            mensagem:"tarefa removida com sucesso"
        }
    }
}
