/*
Método HTTP / API RESTful
    GET (método para leitura no backend);
    POST (método para criar algo no backend);
    PUT (método para editar informações no backend);
    PATCH (método para edição singular ou simples (ex.: sim ou não) de uma informação específica dentro do perfil no backend);
    DELETE (método para remover algo no backend);

Método HTTP Codes:
    Mostra se a resposta que está sendo recebida é válida, se foi com sucesso ou se possui algum erro.
    Para isso utiliza-se response.status(201).
    Os valores dentro do .status() indica o tipo da mensagem de resposta. Os que iniciam com 2, como o 201, é de sucesso. Os que iniciam com 3, é de redirecionamento. 4, para erro de bug no código e 5 são erros inesperados.

Tipos de parâmetros:
    QUERY: Aparece na URL e é usado para manter o estado da página, como exemplo, pagina 5 de uma aplicação com filtros por título: "localhost:3333/ads?page=5&sort=title".
    ROUTE: Aparece na URL da aplicação como exemplo: "localhost:3333/post/como-criar-uma-api".
    BODY: Serve para dados sensíveis, como senha, informações pessoais preenchidas em um formulário. Suas informações não aparecem na URL da aplicação.

*/

import express from "express";
import cors from 'cors';
import { PrismaClient } from "@prisma/client";
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string";

const app = express();
app.use(express.json());
app.use(cors()); //utilizar dentro dos parenteses de cors, apenas os dominios que irão acessar este backend: exemplo -> origin: "https://kyrstenjr.com.br"

const prisma = new PrismaClient({
    log: ['query']
});

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    })

    return response.json(games);
});

app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body = request.body;
    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })
    
    return response.status(201).json(ad);
});

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true
        },

        where: {
            gameId
        },

        orderBy: {
            createdAt: 'desc'
        }
    })

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd),
        }
    }));
});

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;
    const ad = await prisma.ad.findUniqueOrThrow({
        select:{
            discord: true
        },
        
        where: {
            id: adId,
        }
    })
    
    return response.json({
        discord: ad.discord
    });
});

app.listen(3333); 