"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Table from "@/components/table";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { getNodes, Node } from "./actions/nodes";

export default function Home() {
    const t = useTranslations();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNodes = async () => {
            setLoading(true);
            const result = await getNodes();
            setNodes(result.nodes);
            setError(result.error);
            setLoading(false);
        };

        fetchNodes();
    }, []);

    const columns = [
        {
            key: "name" as keyof Node,
            header: t('common.name'),
            render: (value: string | string[], item: Node) => (
                <Link
                    href={`/nodes/${value}/metrics`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                    {value}
                </Link>
            )
        },
        {
            key: "status" as keyof Node,
            header: t('common.status'),
            render: (value: string | string[], item: Node) => (
                <span
                    className={`py-1 px-3 rounded-full text-xs ${value === "Ready" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                        }`}
                >
                    {value === "Ready" ? t('common.ready') : t('common.notReady')}
                </span>
            )
        },
        {
            key: "roles" as keyof Node,
            header: t('common.roles'),
            render: (value: string | string[], item: Node) => (value as string[]).join(", ")
        },
        {
            key: "cpu_usage" as keyof Node,
            header: t('common.cpuUsage'),
            render: (value: string | string[], item: Node) => (
                `${value} / ${item.cpu_capacity} (${item.cpu_usage_percentage}%)`
            )
        },
        {
            key: "memory_usage" as keyof Node,
            header: t('common.memoryUsage'),
            render: (value: string | string[], item: Node) => (
                `${value} / ${item.memory_capacity} (${item.memory_usage_percentage}%)`
            )
        },
    ];

    return (
        <>
            <Head>
                <title>{t('nodes.title')}</title>
                <meta name="description" content={t('nodes.title')} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {loading && <p className="text-center">{t('common.loading')}</p>}
            {error && <p className="text-red-500 text-center">{t('common.error', { message: error })}</p>}
            {!loading && !error && <Table title={t('nodes.title')} data={nodes} columns={columns} />}
        </>
    );
} 