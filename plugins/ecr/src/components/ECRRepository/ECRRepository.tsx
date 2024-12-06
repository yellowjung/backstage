import React from 'react';
import { useAsync } from 'react-use';
import { Table } from '@backstage/core-components';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { columns } from './tableHeadings'

interface RepositoryProps {
    widget: boolean
    host: string
    project: string
    repository: string
    title: string
    width?: number
    height?: number
  }

export const ECRRepository = () => {
    const fetchApi = useApi(fetchApiRef);

    const state = useAsync(async () => {
        const response = await fetchApi.fetch('https://icanhazdadjoke.com/',{
            headers:{
                Accept: 'application/json'
            }
        })
        const joke = await response.text();
        return joke
    }, []);


    return (
        <div>
            <Table
                options={{ paging: false, search: false, padding: 'dense' }}
                title={"TEST"}
                columns={columns}
                data={state.value ? JSON.parse(state.value) : []}
            />
        </div>
    )
}

ECRRepository.defaultProps = {
    title: 'Docker Images',
  }