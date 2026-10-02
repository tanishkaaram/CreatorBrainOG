import ReportPage from '../page';

export default function DynamicReportPage({ params }: { params: { id: string } }) {
    return <ReportPage params={params} />;
}
