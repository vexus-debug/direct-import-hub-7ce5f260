import { ReactNode } from "react";
import { PageTutorial, PageTutorialProps } from "@/components/dashboard/PageTutorial";
import { PageTourButton } from "@/components/dashboard/tour/PageTourButton";


interface PageHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
  badge?: ReactNode;
  tutorial?: PageTutorialProps;
}

export function PageHeader({ title, description, children, badge, tutorial }: PageHeaderProps) {
  return (
    <div
      data-tour="page-header"
      className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <div className="flex items-center gap-2.5">

          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {badge}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2" data-tour="page-actions">
        <PageTourButton />
        {tutorial && <PageTutorial {...tutorial} />}
        {children}
      </div>

    </div>
  );
}
